import { AddressURNSpace } from '@proofzero/urns/address'
import type { AddressURN } from '@proofzero/urns/address'
import type { AccountURN } from '@proofzero/urns/account'

import { JsonError } from '@proofzero/utils/errors'
import { GrantType, ResponseType } from '@proofzero/types/access'

import {
  getAccessClient,
  getAccountClient,
  getAddressClient,
} from '~/platform.server'
import {
  createUserSession,
  destroyAuthenticationParamsSession,
  getConsoleParamsSession,
  parseJwt,
} from '~/session.server'
import { generateGradient } from './gradient.server'
import { redirect } from '@remix-run/cloudflare'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { InternalServerError } from '@proofzero/errors'

type AppData = {
  clientId: string
  redirectUri: string
  state: string
  scope: string[]
  prompt: string
}

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  appData: AppData,
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

  if (['connect', 'reconnect'].includes(appData?.prompt)) {
    const redirectURL = getRedirectURL(
      appData,
      existing ? 'ALREADY_CONNECTED' : undefined
    )

    return redirect(redirectURL, {
      headers: {
        'Set-Cookie': await destroyAuthenticationParamsSession(request, env),
      },
    })
  }

  try {
    const accessClient = getAccessClient(env, traceSpan)
    const clientId = AddressURNSpace.decode(address)
    const redirectUri = env.PASSPORT_REDIRECT_URL
    const scope = ['admin']
    const state = ''
    const { code } = await accessClient.authorize.mutate({
      account,
      responseType: ResponseType.Code,
      clientId,
      redirectUri,
      scope,
      state,
    })

    const grantType = GrantType.AuthenticationCode
    const { accessToken } = await accessClient.exchangeToken.mutate({
      grantType,
      code,
      clientId,
      issuer: new URL(request.url).origin,
    })

    await provisionProfile(accessToken, env, traceSpan, address)

    return createUserSession(
      accessToken,
      getRedirectURL(appData),
      address,
      env,
      appData?.clientId
    )
  } catch (error) {
    throw JsonError(error)
  }
}

const getRedirectURL = (appData: AppData, result: string = 'SUCCESS') => {
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
    connect_result: result,
  })

  redirectURL += `?${urlParams}`

  return redirectURL
}

const provisionProfile = async (
  jwt: string,
  env: Env,
  traceSpan: TraceSpan,
  address: AddressURN
) => {
  const accountClient = getAccountClient(jwt, env, traceSpan)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN

  const profile = await accountClient.getProfile.query({
    account,
  })

  if (!profile) {
    console.log(`Profile doesn't exist for account ${account}. Creating one...`)
    const addressClient = getAddressClient(address, env, traceSpan)
    const newProfile = await addressClient.getAddressProfile
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
    await accountClient.setProfile.mutate({
      name: account,
      profile: { ...newProfile, primaryAddressURN: address },
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
  const accountClient = getAccountClient(jwt, env, traceSpan)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN

  const profile = await accountClient.getProfile.query({
    account,
  })

  // Update the profile with the new primary address if it exists

  if (profile) {
    await accountClient.setProfile.mutate({
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

  const sp = new URLSearchParams({ oauth_error: error })
  const cp = await getConsoleParamsSession(request, env)
  const { clientId } = JSON.parse(cp.get('params'))
  throw redirect(`/authenticate/${clientId}?${sp.toString()}`)
}
