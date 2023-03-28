import {
  EmailAddressType,
  OAuthAddressType,
  CryptoAddressType,
  NodeType,
} from '@proofzero/types/address'

export const normalizeProfileToConnection = (profile: any) => {
  switch (profile.type) {
    case CryptoAddressType.ETH:
      return {
        id: profile.urn,
        address: profile.address,
        title: profile.displayName,
        icon: profile.avatar,
        type: 'Ethereum',
      }
    case OAuthAddressType.Google:
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        type: 'Google',
      }
    case OAuthAddressType.Twitter:
      return {
        id: profile.urn,
        address: `@${profile.screen_name}`,
        title: profile.name,
        icon: profile.profile_image_url_https,
        type: 'Twitter',
      }
    case OAuthAddressType.GitHub:
      return {
        id: profile.urn,
        address: profile.login,
        title: profile.name,
        icon: profile.avatar_url,
        type: 'GitHub',
      }
    case 'microsoft':
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        type: 'Microsoft',
      }
    case OAuthAddressType.Apple:
      return {
        id: profile.urn,
        address: profile.name,
        title: profile.name,
        icon: profile.picture,
        type: 'Apple',
      }
    case OAuthAddressType.Discord:
      return {
        id: profile.urn,
        address: `${profile.username}#${profile.discriminator}`,
        title: profile.username,
        icon: `https://cdn.discordapp.com/avatars/${profile.discordId}/${profile.avatar}.png`,
        type: 'Discord',
      }
    case EmailAddressType.Email:
      return {
        id: profile.urn,
        address: profile.email,
        title: profile.name,
        icon: profile.picture,
        type: 'Email',
      }
  }
}
