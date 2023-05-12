import React from 'react'
import appleIcon from '../../../assets/social_icons/apple.svg'
import discordIcon from '../../../assets/social_icons/discord.svg'
import githubIcon from '../../../assets/social_icons/github.svg'
import googleIcon from '../../../assets/social_icons/google.svg'
import microsoftIcon from '../../../assets/social_icons/microsoft.svg'
import twitterIcon from '../../../assets/social_icons/twitter.svg'
import { Button } from '../Button'
import { Text } from '../../text/Text'

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
  displayContinueWith?: boolean
}

const ConnectOAuthButton = ({
  provider,
  fullSize = true,
  displayContinueWith = false,
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
        }  items-center w-full space-x-3 h-[36px]`}
      >
        <img
          className="w-5 h-5"
          src={providerIconDict[provider]}
          alt={provider}
        />

        {fullSize && (
          <Text weight="medium" className="truncate text-gray-800">
            {displayContinueWith ? 'Continue with ' : ''}{' '}
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </Text>
        )}
      </div>
    </Button>
  )
}

export default ConnectOAuthButton