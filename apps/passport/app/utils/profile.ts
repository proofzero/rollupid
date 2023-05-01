import {
  EmailAddressType,
  OAuthAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

export const getProfileTypeTitle = (type: string) => {
  switch (type) {
    case CryptoAddressType.ETH:
      return 'Ethereum'
    case CryptoAddressType.Wallet:
      return 'Smart Wallet'
    case EmailAddressType.Email:
      return 'Email'
    case OAuthAddressType.Apple:
      return 'Apple'
    case OAuthAddressType.Discord:
      return 'Discord'
    case OAuthAddressType.GitHub:
      return 'GitHub'
    case OAuthAddressType.Google:
      return 'Google'
    case OAuthAddressType.Microsoft:
      return 'Microsoft'
    case OAuthAddressType.Twitter:
      return 'Twitter'
    default:
      return ''
  }
}
