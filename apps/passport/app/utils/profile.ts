import {
  EmailAddressType,
  OAuthAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

export const normalizeProfileToConnection = (profile: any) => {
  switch (profile.type) {
    case CryptoAddressType.ETH:
      return {
        id: profile.urn,
        address: profile.address,
        title: profile.displayName,
        icon: profile.avatar,
        chain: 'Ethereum',
      }
    case OAuthAddressType.Google:
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Google',
      }
    case OAuthAddressType.Twitter:
      return {
        id: profile.urn,
        address: `@${profile.screen_name}`,
        title: profile.name,
        icon: profile.profile_image_url_https,
        chain: 'Twitter',
      }
    case OAuthAddressType.GitHub:
      return {
        id: profile.urn,
        address: profile.login,
        title: profile.name,
        icon: profile.avatar_url,
        chain: 'GitHub',
      }
    case 'microsoft':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Microsoft',
      }
    case OAuthAddressType.Apple:
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.picture,
        chain: 'Apple',
      }
    case OAuthAddressType.Discord:
      return {
        id: profile.urn,
        address: `${profile.username}#${profile.discriminator}`,
        title: profile.username,
        icon: `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`,
        chain: 'Discord',
      }
    case EmailAddressType.Email:
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        chain: 'Email',
      }
  }
}
