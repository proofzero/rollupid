import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'
import type { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { getGalaxyClient } from '~/helpers/clients'
import type { FullProfile } from '~/types'
import { imageFromAddressType } from './icons'

export const getAccountProfile = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()

  const profileRes = await galaxyClient.getProfile(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { profile, links, gallery, connectedAddresses } = profileRes
  return {
    ...profile,
    links,
    gallery,
    addresses: connectedAddresses,
  } as FullProfile
}

export const getAuthorizedApps = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()

  const { authorizedApps } = await galaxyClient.getAuthorizedApps(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return authorizedApps
}

export const getAccountAddresses = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()
  const addressesRes = await galaxyClient.getConnectedAddresses(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const addresses = addressesRes.connectedAddresses
  return addresses
}

export const getAddressProfile = async (addressURN: AddressURN) => {
  const galaxyClient = await getGalaxyClient()
  const addressProfile = await galaxyClient.getProfileFromAddress({
    addressURN,
  })

  const profile = addressProfile

  return {
    ...profile.profile,
    links: profile.links,
    gallery: profile.gallery,
    connectedAccounts: profile.connectedAddresses,
  }
}

export const getAddressProfiles = async (
  jwt: string,
  addressURNList: AddressURN[]
) => {
  const galaxyClient = await getGalaxyClient()
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
