import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import ethereumIcon from '@kubelt/design-system/src/assets/social_icons/ethereum.svg'
import appleIcon from '@kubelt/design-system/src/assets/social_icons/apple.svg'
import githubIcon from '@kubelt/design-system/src/assets/social_icons/github.svg'
import googleIcon from '@kubelt/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@kubelt/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@kubelt/design-system/src/assets/social_icons/twitter.svg'
import { CryptoAddressType, OAuthAddressType } from '@kubelt/types/address'

export const Links = ({ links }: any) =>
  links && (
    <div className="flex flex-col space-y-4 mx-3 md:mx-0">
      {links
        .map(
          (link: {
            name: string
            url: string
            verified: boolean
            provider: string
          }) => {
            let providerIcon = null
            switch (link.provider) {
              case CryptoAddressType.ETH:
                providerIcon = ethereumIcon
                break
              case OAuthAddressType.Apple:
                providerIcon = appleIcon
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

            return { ...link, providerIcon }
          }
        )
        .map(
          (
            link: {
              name: string
              url: string
              verified: boolean
              provider: string
              providerIcon: string | null
            },
            i: number
          ) => (
            <button
              key={`${link.name}-${link.url}-${i}`}
              className="
          bg-gray-100 hover:bg-gray-200
          transition-colors
          rounded-full
          justify-center
          items-center
          w-full
          py-5"
            >
              <a
                href={link.url}
                className="flex flex-row justify-center items-center space-x-2.5"
              >
                {link.providerIcon && (
                  <img src={link.providerIcon} className="w-5 h-5" />
                )}
                <Text weight="medium" className="text-gray-600">
                  {link.name}
                </Text>
              </a>
            </button>
          )
        )}
    </div>
  )
