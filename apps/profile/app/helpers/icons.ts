import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'

import appleIcon from '@kubelt/design-system/src/assets/social_icons/apple.svg'
import discordIcon from '@kubelt/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@kubelt/design-system/src/assets/social_icons/github.svg'
import googleIcon from '@kubelt/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@kubelt/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@kubelt/design-system/src/assets/social_icons/twitter.svg'
import ethereumIcon from '@kubelt/design-system/src/assets/social_icons/ethereum.svg'

export const imageFromAddressType = (addressType: string) => {
  let providerIcon = null
  switch (addressType) {
    case CryptoAddressType.ETH:
      providerIcon = ethereumIcon
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
