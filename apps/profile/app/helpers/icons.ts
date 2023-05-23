import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

import ethereumIcon from '@proofzero/design-system/src/assets/social_icons/ethereum.svg'
import scWalletIcon from '@proofzero/design-system/src/assets/social_icons/sc_wallet.svg'
import emailIcon from '@proofzero/design-system/src/assets/social_icons/email.svg'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'
import discordIcon from '@proofzero/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@proofzero/design-system/src/atoms/providers/Github'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@proofzero/design-system/src/assets/social_icons/twitter.svg'

export const imageFromAddressType = (addressType: string) => {
  let providerIcon = null
  switch (addressType) {
    case CryptoAddressType.ETH:
      providerIcon = ethereumIcon
      break
    case CryptoAddressType.Wallet:
      providerIcon = scWalletIcon
      break
    case EmailAddressType.Email:
      providerIcon = emailIcon
      break
    case OAuthAddressType.Apple:
      providerIcon = appleIcon
      break
    case OAuthAddressType.Discord:
      providerIcon = discordIcon
      break
    case OAuthAddressType.GitHub:
      providerIcon = githubIcon
      break
    case OAuthAddressType.Google:
      providerIcon = googleIcon
      break
    case OAuthAddressType.Microsoft:
      providerIcon = microsoftIcon
      break
    case OAuthAddressType.Twitter:
      providerIcon = twitterIcon
      break
  }

  return providerIcon
}
