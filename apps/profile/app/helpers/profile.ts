import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'
import type { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { getGalaxyClient } from '~/helpers/clients'
import { imageFromAddressType } from './icons'
import type { FullProfile } from '~/types'
import type { AccountURN } from '@kubelt/urns/account'
import type { TraceSpan } from '@kubelt/platform-middleware/trace'
import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'

export const getAccountProfile = async (
  {
    accountURN,
    jwt,
  }: {
    accountURN: AccountURN
    jwt?: string
  },
  traceSpan: TraceSpan
) => {
  /**
   * note: jwt is only important for setting profile in profile account settings
   * TODO: uncomment after migrations
   *
   * const profile = await ProfileKV.get<FullProfile>(accountURN, 'json')
   *
   * if (profile) return profile
   */

  // TODO: DEPRECATE THIS PROFILE MIGRATION
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )

  const profileRes = await galaxyClient.getProfile(
    accountURN ? { targetAccountURN: accountURN } : undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { profile: acctProfile, links, gallery } = profileRes

  const fullProfile = {
    ...acctProfile,
    links,
    gallery,
  } as FullProfile

  await ProfileKV.put(accountURN, JSON.stringify(fullProfile))
  return { ...fullProfile }
  // END OF PROFILE MIGRATION
}

export const getAuthorizedApps = async (jwt: string, traceSpan: TraceSpan) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )

  const { authorizedApps } = await galaxyClient.getAuthorizedApps(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return authorizedApps
}

export const getAccountAddresses = async (
  jwt: string,
  traceSpan: TraceSpan
) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )
  const addressesRes = await galaxyClient.getConnectedAddresses(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return addressesRes.addresses || []
}

export const getAddressProfiles = async (
  jwt: string,
  addressURNList: AddressURN[],
  traceSpan: TraceSpan
) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )
  const addressProfilesRes = await galaxyClient.getAddressProfiles(
    {
      addressURNList,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { addressProfiles } = addressProfilesRes

  return addressProfiles
}

/**
 * Prepares Crypto and OAuth profiles
 * to be displayed in generic sortable list;
 * Adds additional properties that are used
 * for filtering when posting data to the server.
 */
export const normalizeProfileToLinks = (profile: any) => {
  switch (profile.__typename) {
    case 'CryptoAddressProfile':
      return {
        id: profile.urn,
        // Some providers can be built on client side
        address: `https://etherscan.io/address/${profile.address}`,
        title: profile.displayName,
        icon: imageFromAddressType(CryptoAddressType.ETH),
        provider: CryptoAddressType.ETH,
        /**
         * 'linkable' allows the account list
         * to disable non linkable accounts
         * which are unclear as to how to
         * generate a public url
         */
        linkable: true,
      }
    case 'OAuthGoogleProfile':
      return {
        id: profile.urn,
        // Some providers don't have an address
        // and are thus unlinkable
        address: profile.email || '',
        title: 'Google',
        icon: imageFromAddressType(OAuthAddressType.Google),
        provider: OAuthAddressType.Google,
      }
    case 'OAuthTwitterProfile':
      return {
        id: profile.urn,
        address: `https://twitter.com/${profile.screen_name}`,
        title: 'Twitter',
        icon: profile.profile_image_url_https,
        provider: OAuthAddressType.Twitter,
        linkable: true,
      }
    case 'OAuthGithubProfile':
      return {
        id: profile.urn,
        // Some providers give us public
        // endpoints
        address: profile.html_url,
        title: 'GitHub',
        icon: imageFromAddressType(OAuthAddressType.GitHub),
        provider: OAuthAddressType.GitHub,
        linkable: true,
      }
    case 'OAuthMicrosoftProfile':
      return {
        id: profile.urn,
        address: profile.email || '',
        title: 'Microsoft',
        icon: imageFromAddressType(OAuthAddressType.Microsoft),
        provider: OAuthAddressType.Microsoft,
      }
    case 'OAuthAppleProfile':
      return {
        id: profile.urn,
        address: profile.name || '',
        title: 'Apple',
        icon: imageFromAddressType(OAuthAddressType.Apple),
        provider: OAuthAddressType.Apple,
      }
    case 'OAuthDiscordProfile':
      return {
        id: profile.urn,
        address: '',
        title: 'Discord',
        icon: imageFromAddressType(OAuthAddressType.Discord),
        provider: OAuthAddressType.Discord,
      }
  }

  throw new Error('profile.__typename uknown')
}

export const normalizeProfileToConnection = (profile: any) => {
  switch (profile.__typename) {
    case 'CryptoAddressProfile':
      return {
        id: profile.urn,
        address: profile.address,
        title: profile.displayName,
        icon: profile.avatar,
        chain: 'Ethereum',
      }
    case 'OAuthGoogleProfile':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Google',
      }
    case 'OAuthTwitterProfile':
      return {
        id: profile.urn,
        address: `@${profile.screen_name}`,
        title: profile.name,
        icon: profile.profile_image_url_https,
        chain: 'Twitter',
      }
    case 'OAuthGithubProfile':
      return {
        id: profile.urn,
        address: profile.login,
        title: profile.name,
        icon: profile.avatar_url,
        chain: 'GitHub',
      }
    case 'OAuthMicrosoftProfile':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Microsoft',
      }
    case 'OAuthAppleProfile':
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.picture,
        chain: 'Apple',
      }
    case 'OAuthDiscordProfile':
      return {
        id: profile.urn,
        address: `${profile.username}#${profile.discriminator}`,
        title: profile.username,
        icon: `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`,
        chain: 'Discord',
      }
  }
}
