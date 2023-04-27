// import { Form } from '@remix-run/react'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'

import appleIcon from '@proofzero/design-system/src/assets/social_icons/apple.svg'
import discordIcon from '@proofzero/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@proofzero/design-system/src/assets/social_icons/github.svg'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@proofzero/design-system/src/assets/social_icons/twitter.svg'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export type OAuthProvider =
  | 'apple'
  | 'discord'
  | 'github'
  | 'google'
  | 'microsoft'
  | 'twitter'

// Can possibly be replaced with
// react-icons
const providerIconDict: { [key in OAuthProvider]: string } = {
  apple: appleIcon,
  discord: discordIcon,
  github: githubIcon,
  google: googleIcon,
  microsoft: microsoftIcon,
  twitter: twitterIcon,
}

type ConnectOAuthButtonProps = {
  provider: OAuthProvider
  fullSize?: boolean
}

const ConnectOAuthButton = ({
  provider,
  fullSize = true,
}: ConnectOAuthButtonProps) => {
  return (
    <Button
      className={'button w-full hover:bg-gray-100'}
      btnType={'secondary-alt'}
      isSubmit={true}
      role={provider}
    >
      <div
        className={`flex ${
          fullSize ? '' : 'justify-center'
        }  items-center w-full py-1.5 space-x-3`}
      >
        <img
          className="w-5 h-5"
          src={providerIconDict[provider]}
          alt={provider}
        />

        {fullSize && (
          <Text weight="medium" className="truncate text-gray-800">
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </Text>
        )}
      </div>
    </Button>
  )
}

export default ConnectOAuthButton
