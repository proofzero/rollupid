import React from 'react'
import discordIcon from '../../../assets/social_icons/discord.svg'
import googleIcon from '../../../assets/social_icons/google.svg'
import microsoftIcon from '../../../assets/social_icons/microsoft.svg'
import twitterIcon from '../../../assets/social_icons/twitter.svg'
import { Button } from '../Button'
import { Text } from '../../text/Text'

import Apple from '../../providers/Apple'
import Github from '../../providers/Github'

export type OAuthProvider =
  | 'apple'
  | 'discord'
  | 'github'
  | 'google'
  | 'microsoft'
  | 'twitter'

const providerImgBuildHelper = (provider: string, iconSrc: string) => (
  <img className="w-5 h-5" src={iconSrc} alt={provider} />
)

const providerIconDict: { [key in OAuthProvider]: JSX.Element } = {
  apple: Apple,
  discord: providerImgBuildHelper('discord', discordIcon),
  github: Github,
  google: providerImgBuildHelper('google', googleIcon),
  microsoft: providerImgBuildHelper('microsoft', microsoftIcon),
  twitter: providerImgBuildHelper('twitter', twitterIcon),
}

type ConnectOAuthButtonProps = {
  provider: OAuthProvider
  fullSize?: boolean
  displayContinueWith?: boolean
  submit?: boolean
}

const ConnectOAuthButton = ({
  provider,
  fullSize = true,
  displayContinueWith = false,
  submit = false,
}: ConnectOAuthButtonProps) => {
  return (
    <Button
      className={
        'button w-full dark:bg-[#374151] dark:border-gray-600 hover:bg-gray-100'
      }
      btnType={'secondary-alt'}
      isSubmit={submit}
      role={provider}
    >
      <div
        className={`flex ${
          fullSize ? '' : 'justify-center'
        }  items-center w-full space-x-3 h-[36px]`}
      >
        {providerIconDict[provider]}

        {fullSize && (
          <Text
            weight="medium"
            className="truncate text-gray-800 dark:text-white"
          >
            {displayContinueWith ? 'Continue with ' : ''}{' '}
            {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </Text>
        )}
      </div>
    </Button>
  )
}

export default ConnectOAuthButton
