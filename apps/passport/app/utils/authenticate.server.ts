import { AddressURNSpace } from '@kubelt/urns/address'
import type { AddressURN } from '@kubelt/urns/address'
import type { AccountURN } from '@kubelt/urns/account'

import { GrantType, ResponseType } from '@kubelt/types/access'

import {
  getAccessClient,
  getAccountClient,
  getAddressClient,
} from '~/platform.server'
import { createUserSession, parseJwt } from '~/session.server'
import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'
import { generateGradient } from './gradient.server'

export const authenticateAddress = async (
  address: AddressURN,
  account: AccountURN,
  appData: {
    clientId: string
    redirectUri: string
    state: string
    scope: string
  } | null,
  env: Env
) => {
  const accessClient = getAccessClient(env)
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

  await provisionProfile(accessToken, env, address)

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
    })

    redirectURL += `?${urlParams}`
  }

  return createUserSession(accessToken, redirectURL, address, env)
}

const provisionProfile = async (jwt: string, env: Env, address: AddressURN) => {
  const accountClient = getAccountClient(jwt, env)
  const parsedJWT = parseJwt(jwt)
  const account = parsedJWT.sub as AccountURN

  const profile = await accountClient.getProfile.query({
    account,
  })

  if (!profile) {
    console.log("Profile doesn't exist, creating one...")
    const addressClient = await getAddressClient(address, env)
    const newProfile = await addressClient.getAddressProfile
      .query()
      .then(async (res) => {
        switch (res.type) {
          case CryptoAddressType.ETH: {
            const gradient = await generateGradient(res.profile.address, env)
            return {
              displayName: res.profile.displayName || res.profile.address,
              pfp: {
                image: res.profile.avatar || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.GitHub: {
            const gradient = await generateGradient(res.profile.login, env)
            return {
              displayName: res.profile.name || res.profile.login,
              pfp: {
                image: res.profile.avatar_url || gradient,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Google: {
            const gradient = await generateGradient(res.profile.email, env)
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.picture,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Twitter: {
            const gradient = await generateGradient(
              res.profile.id.toString(),
              env
            )
            return {
              displayName: res.profile.name,
              pfp: {
                image: res.profile.profile_image_url_https,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Microsoft: {
            const gradient = await generateGradient(
              res.profile.sub.toString(),
              env
            )
            return {
              displayName:
                res.profile.name ||
                res.profile.given_name ||
                res.profile.email ||
                res.profile.sub,
              pfp: {
                //Cached profile image
                image: res.profile.rollupidImageUrl as string,
              },
              cover: gradient,
            }
          }
          case OAuthAddressType.Apple: {
            const gradient = await generateGradient(
              res.profile.sub.toString(),
              env
            )
            const { firstName, lastName } = res.profile.name
            return {
              cover: gradient,
              displayName: `${firstName} ${lastName}`,
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
  }
}
