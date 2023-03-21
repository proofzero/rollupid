import { AddressURNSpace } from '@proofzero/urns/address'
import type { AddressURN } from '@proofzero/urns/address'
import type { AccountURN } from '@proofzero/urns/account'

import { throwJSONError } from '@proofzero/utils/errors'
import { GrantType, ResponseType } from '@proofzero/types/access'

import {
  getAccessClient,
  getAccountClient,
  getAddressClient,
} from '~/platform.server'
import { createUserSession, parseJwt } from '~/session.server'
import { CryptoAddressType, OAuthAddressType } from '@proofzero/types/address'
import { generateGradient } from './gradient.server'
import { redirect } from '@remix-run/cloudflare'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  appData: {
    clientId: string
    redirectUri: string
    state: string
    scope: string
    prompt: string
  } | null,
  env: Env,
  traceSpan: TraceSpan,
  existing: boolean = false
) => {
  if (appData?.prompt === 'login') {
    return redirect(
      `${appData.redirectUri}${existing ? `?error=ALREADY_CONNECTED` : ''}`
    )
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
    })

    await provisionProfile(accessToken, env, traceSpan, address)

    let redirectURL = '/authorize'
    if (appData) {
      const authAppId = appData.clientId
      const authRedirectUri = appData.redirectUri
      const authState = appData.state
      const authScope = appData.scope
      const urlParams = new URLSearchParams({
        client_id: authAppId,
        redirect_uri: authRedirectUri,
        state: authState,
        scope: authScope,
        prompt: 'none',
      })

      redirectURL += `?${urlParams}`
    }

    return createUserSession(
      accessToken,
      redirectURL,
      address,
      env,
      appData?.clientId
    )
  } catch (error) {
    throwJSONError(error)
  }
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
        switch (res.type) {
          case CryptoAddressType.ETH: {
            const gradient = await generateGradient(
              res.profile.address,
              env,
              traceSpan
            )
            return {
              displayName: res.profile.displayName || res.profile.address,
              pfp: {
                image: res.profile.avatar || gradient,
              },
            }
          }
          case OAuthAddressType.GitHub: {
            const gradient = await generateGradient(
              res.profile.login,
              env,
              traceSpan
            )
            return {
              displayName: res.profile.name || res.profile.login,
              pfp: {
                image: res.profile.avatar_url || gradient,
              },
            }
          }
          case OAuthAddressType.Google: {
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.picture,
              },
            }
          }
          case OAuthAddressType.Twitter: {
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.profile_image_url_https,
              },
            }
          }
          case OAuthAddressType.Microsoft: {
            return {
              displayName:
                res.profile.name ||
                res.profile.given_name ||
                res.profile.email ||
                res.profile.sub,
              pfp: {
                //Cached profile image
                image: res.profile.picture as string,
              },
            }
          }
          case OAuthAddressType.Apple: {
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.picture,
              },
            }
          }
          case OAuthAddressType.Discord: {
            const gradient = await generateGradient(
              res.profile.id,
              env,
              traceSpan
            )
            const { id, avatar } = res.profile
            return {
              displayName: res.profile.username,
              pfp: {
                image: avatar
                  ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
                  : gradient,
              },
            }
          }
          default:
            throw new Error(
              'Unsupported OAuth type encountered in profile response.'
            )
        }
      })
    // set the default profile
    await accountClient.setProfile.mutate({
      name: account,
      profile: newProfile,
    })
  } else {
    console.log(`Profile for account ${account} found. Continuing...`)
  }
}
