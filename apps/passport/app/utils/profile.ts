import {
  EmailAccountType,
  OAuthAccountType,
  CryptoAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'

export const getProfileTypeTitle = (type: string) => {
  switch (type) {
    case CryptoAccountType.ETH:
      return 'Ethereum'
    case CryptoAccountType.Wallet:
      return 'Smart Wallet'
    case EmailAccountType.Email:
      return 'Email'
    case WebauthnAccountType.WebAuthN:
      return 'Passkey'
    case OAuthAccountType.Apple:
      return 'Apple'
    case OAuthAccountType.Discord:
      return 'Discord'
    case OAuthAccountType.GitHub:
      return 'GitHub'
    case OAuthAccountType.Google:
      return 'Google'
    case OAuthAccountType.Microsoft:
      return 'Microsoft'
    case OAuthAccountType.Twitter:
      return 'Twitter'
    default:
      return ''
  }
}
