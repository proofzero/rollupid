import { type AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { type IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'

import { GrantType, ResponseType } from '@proofzero/types/authorization'

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

import { createIdentityMergeState } from '~/session.server'

export const authenticateAccount = async (
  account: AccountURN,
  identity: IdentityURN,
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
    const headers = new Headers()
    let result = undefined

    if (
      existing &&
      (appData.rollup_action === 'connect' ||
        appData.rollup_action.startsWith('groupconnect'))
    ) {
      const source = identity
      const target = parseJwt(jwt).sub
      if (!target) result = 'ACCOUNT_CONNECT_ERROR'
      else if (source === target) result = 'ALREADY_CONNECTED_ERROR'
      else if (IdentityURNSpace.is(target) && source !== target) {
        result = 'ACCOUNT_LINKED_ERROR'
        headers.append(
          'Set-Cookie',
          await createIdentityMergeState(request, env, account, source, target)
        )
      }
    }

    return redirect(getAuthzRedirectURL(appData, result), { headers })
  }

  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context })
  const clientId = AccountURNSpace.decode(account)
  const redirectUri = env.PASSPORT_REDIRECT_URL
  const scope = ['admin']
  const state = ''
  const { code } = await coreClient.authorization.authorize.mutate({
    identity,
    responseType: ResponseType.Code,
    clientId,
    redirectUri,
    scope,
    state,
  })

  const grantType = GrantType.AuthenticationCode
  const { accessToken } = await coreClient.authorization.exchangeToken.mutate({
    grantType,
    code,
    clientId,
    issuer: new URL(request.url).origin,
  })

  await provisionProfile(accessToken, env, traceSpan, account)

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
  accountURN: AccountURN
) => {
  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, accountURN, jwt })
  const parsedJWT = parseJwt(jwt)
  const identity = parsedJWT.sub as IdentityURN

  const profile = await coreClient.identity.getProfile.query({
    identity,
  })

  if (!profile) {
    console.log(
      `Profile doesn't exist for identity ${identity}. Creating one...`
    )
    const newProfile = await coreClient.account.getAccountProfile
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
    await coreClient.identity.setProfile.mutate({
      name: identity,
      profile: { ...newProfile, primaryAccountURN: accountURN },
    })
  } else {
    console.log(`Profile for identity ${identity} found. Continuing...`)
  }
}

export const setNewPrimaryAccount = async (
  jwt: string,
  env: Env,
  traceSpan: TraceSpan,
  newPrimaryAccount: AccountURN,
  pfp: string,
  displayName: string
) => {
  const context = { env: { Core: env.Core }, traceSpan }
  const coreClient = getCoreClient({ context, jwt })
  const parsedJWT = parseJwt(jwt)
  const identity = parsedJWT.sub as IdentityURN

  const profile = await coreClient.identity.getProfile.query({
    identity,
  })

  // Update the profile with the new primary account if it exists

  if (profile) {
    await coreClient.identity.setProfile.mutate({
      name: identity,
      profile: {
        displayName: displayName,
        pfp: { ...profile.pfp, image: pfp },
        primaryAccountURN: newPrimaryAccount,
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
