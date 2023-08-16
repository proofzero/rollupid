import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'

import ethereumIcon from '@proofzero/design-system/src/assets/social_icons/ethereum.svg'
import scWalletIcon from '@proofzero/design-system/src/assets/social_icons/sc_wallet.svg'
import emailIcon from '@proofzero/design-system/src/assets/social_icons/email.svg'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'
import discordIcon from '@proofzero/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@proofzero/design-system/src/atoms/providers/Github'
import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
import twitterIcon from '@proofzero/design-system/src/assets/social_icons/twitter.svg'

export const imageFromAccountType = (accountType: string) => {
  let providerIcon = null
  switch (accountType) {
    case CryptoAccountType.ETH:
      providerIcon = ethereumIcon
      break
    case CryptoAccountType.Wallet:
      providerIcon = scWalletIcon
      break
    case EmailAccountType.Email:
      providerIcon = emailIcon
      break
    case OAuthAccountType.Apple:
      providerIcon = appleIcon
      break
    case OAuthAccountType.Discord:
      providerIcon = discordIcon
      break
    case OAuthAccountType.GitHub:
      providerIcon = githubIcon
      break
    case OAuthAccountType.Google:
      providerIcon = googleIcon
      break
    case OAuthAccountType.Microsoft:
      providerIcon = microsoftIcon
      break
    case OAuthAccountType.Twitter:
      providerIcon = twitterIcon
      break
  }

  return providerIcon
}
