import { AddressURNSpace } from '@proofzero/urns/address'
import type { AddressURN } from '@proofzero/urns/address'
import type { AccountURN } from '@proofzero/urns/account'

import { GrantType, ResponseType } from '@proofzero/types/access'

import { getCoreClient } from '~/platform.server'
import {
  createUserSession,
  getAuthzCookieParamsSession,
  getUserSession,
  parseJwt,
} from '~/session.server'
import { generateGradient } from './gradient.server'
import { redirect } from '@remix-run/cloudflare'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { InternalServerError } from '@proofzero/errors'
import {
  AUTHN_PARAMS_SESSION_KEY,
  createAuthenticatorSessionStorage,
} from '~/auth.server'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  appData: AuthzParams,
  request: Request,
  env: Env,
  traceSpan: TraceSpan,
  existing: boolean = false
) => {
  if (!appData?.redirectUri) {
    throw new InternalServerError({
      message:
        'Could not complete authentication. Please return to application and try again.',
    })
  }

  const jwt = await getUserSession(request, env, appData?.clientId)
  if (
    appData.rollup_action &&
    (['connect', 'reconnect'].includes(appData?.rollup_action) ||
      appData?.rollup_action.startsWith('groupconnect'))
  ) {
    let result = undefined

    if (
      existing &&
      (appData.rollup_action === 'connect' ||
        appData.rollup_action.startsWith('groupconnect'))
    ) {
      const loggedInAccount = parseJwt(jwt).sub
      if (account !== loggedInAccount) {
        result = 'ACCOUNT_CONNECT_ERROR'
      } else {
        result = 'ALREADY_CONNECTED_ERROR'
      }
    }

    const redirectURL = getAuthzRedirectURL(appData, result)

    return redirect(redirectURL)
  }

  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context })
  const clientId = AddressURNSpace.decode(address)
  const redirectUri = env.PASSPORT_REDIRECT_URL
  const scope = ['admin']
  const state = ''
  const { code } = await coreClient.access.authorize.mutate({
    account,
    responseType: ResponseType.Code,
    clientId,
    redirectUri,
    scope,
    state,
  })

  const grantType = GrantType.AuthenticationCode
  const { accessToken } = await coreClient.access.exchangeToken.mutate({
    grantType,
    code,
    clientId,
    issuer: new URL(request.url).origin,
  })

  await provisionProfile(accessToken, env, traceSpan, address)

  return createUserSession(
    request,
    accessToken,
    getAuthzRedirectURL(appData),
    env,
    appData?.clientId
  )
}

export const getAuthzRedirectURL = (
  appData: AuthzParams,
  result: string = 'SUCCESS'
) => {
  let redirectURL = '/authorize'
  const authAppId = appData.clientId
  const authRedirectUri = appData.redirectUri
  const authState = appData.state
  const authScope = appData.scope
  const urlParams = new URLSearchParams({
    client_id: authAppId,
    redirect_uri: authRedirectUri,
    state: authState,
    scope: authScope.join(' '),
    rollup_result: result,
  })

  if (appData.prompt) urlParams.append('prompt', appData.prompt)

  redirectURL += `?${urlParams}`

  return redirectURL
}

const provisionProfile = async (
  jwt: string,
  env: Env,
  traceSpan: TraceSpan,
  addressURN: AddressURN
) => {
  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, addressURN, jwt })
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN

  const profile = await coreClient.account.getProfile.query({
    account,
  })

  if (!profile) {
    console.log(`Profile doesn't exist for account ${account}. Creating one...`)
    const newProfile = await coreClient.address.getAddressProfile
      .query()
      .then(async (res) => {
        const gradient = await generateGradient(res.address, env, traceSpan)
        return {
          displayName: res.title,
          pfp: {
            image: res.icon || gradient,
          },
        }
      })
    // set the default profile
    await coreClient.account.setProfile.mutate({
      name: account,
      profile: { ...newProfile, primaryAddressURN: addressURN },
    })
  } else {
    console.log(`Profile for account ${account} found. Continuing...`)
  }
}

export const setNewPrimaryAddress = async (
  jwt: string,
  env: Env,
  traceSpan: TraceSpan,
  newPrimaryAddress: AddressURN,
  pfp: string,
  displayName: string
) => {
  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, jwt })
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN

  const profile = await coreClient.account.getProfile.query({
    account,
  })

  // Update the profile with the new primary address if it exists

  if (profile) {
    await coreClient.account.setProfile.mutate({
      name: account,
      profile: {
        displayName: displayName,
        pfp: { ...profile.pfp, image: pfp },
        primaryAddressURN: newPrimaryAddress,
      },
    })
  }
}

export const checkOAuthError = async (request: Request, env: Env) => {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  if (!error) return

  const uri = searchParams.get('error_uri')
  const description = searchParams.get('error_description')

  console.error({ error, uri, description })

  const authzParams = await getAuthzCookieParamsSession(request, env)
  const authenticatorStorage = await createAuthenticatorSessionStorage(
    request,
    env
  )
  const session = await authenticatorStorage.getSession(
    request.headers.get('Cookie')
  )
  const authnParams = session.get(AUTHN_PARAMS_SESSION_KEY)
  const redirectQueryParams = new URLSearchParams(authnParams)
  redirectQueryParams.append('oauth_error', error)
  const { clientId } = JSON.parse(authzParams.get('params'))
  throw redirect(`/authenticate/${clientId}?${redirectQueryParams.toString()}`)
}
