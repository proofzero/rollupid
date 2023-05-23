import React from 'react'

import subtractLogo from '../../assets/subtract-logo.svg'

import { Text } from '../../atoms/text/Text'
import { Avatar } from '../../atoms/profile/avatar/Avatar'

import { AuthButton } from '../../molecules/auth-button/AuthButton'
import { AppProfile, AuthenticationScreenDefaults } from './Authentication'
import { TosAndPPol } from '../../atoms/info/TosAndPPol'

type UserProfile = {
  pfpURL: string
  displayName: string
}

export type AccountSelectProps = {
  logoURL?: string
  userProfile: UserProfile
  appProfile: AppProfile
  onAuth: () => void
  onSignOut: () => void
  onChooseOther: () => void
}

export default ({
  logoURL = AuthenticationScreenDefaults.defaultLogoURL,
  userProfile,
  appProfile,
  onAuth = () => {},
  onSignOut = () => {},
  onChooseOther = () => {},
}: AccountSelectProps) => {
  return (
    <div className="relative">
      <div
        className={`relative flex shrink grow-0 flex-col items-center gap-4 mx-auto bg-white p-6 min-h-[100dvh] lg:min-h-[675px] max-h-[100dvh] w-full lg:w-[418px] lg:rounded-lg overflow-auto`}
        style={{
          border: '1px solid #D1D5DB',
          boxSizing: 'border-box',
        }}
      >
        <Avatar src={logoURL} size="sm"></Avatar>
        <div className={'flex flex-col items-center gap-2'}>
          <Text size="xl" weight="semibold">
            Choose an account
          </Text>

          {appProfile?.name && (
            <Text className="text-gray-500">
              to continue to &quot;
              <a
                href={appProfile.websiteURL}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-500"
              >
                {appProfile.name}
              </a>
              &quot;
            </Text>
          )}
        </div>

        <div className="flex-1 w-full flex flex-col gap-4 relative">
          <div className="relative">
            <AuthButton
              onClick={onAuth}
              Graphic={
                <>
                  {userProfile.pfpURL && (
                    <img
                      className="w-full h-full rounded-full"
                      src={userProfile.pfpURL}
                      alt="PFP"
                    />
                  )}
                </>
              }
              Addon={<div className="w-14"></div>}
              text={userProfile.displayName}
            />

            <div className="absolute z-10 right-0 top-0 bottom-0 flex flex-row-reverse justify-center items-center px-3">
              <Text
                size="xs"
                className="cursor-pointer text-gray-500"
                onClick={onSignOut}
              >
                Sign out
              </Text>
            </div>
          </div>

          <div className="my-1 flex flex-row items-center justify-center space-x-3">
            <hr className="h-px w-16 bg-gray-500" />
            <Text>or</Text>
            <hr className="h-px w-16 bg-gray-500" />
          </div>

          <AuthButton text="Choose other account" onClick={onChooseOther} />

          {(appProfile?.termsURL || appProfile?.privacyURL) && (
            <Text size="sm" className="text-gray-500 mt-7">
              Before using this app, you can review{' '}
              {appProfile?.name ?? `Company`}
              &apos;s{' '}
              <a href={appProfile.privacyURL} className="text-indigo-500">
                privacy policy
              </a>
              {appProfile?.termsURL && appProfile?.privacyURL && (
                <span> and </span>
              )}
              <a href={appProfile.termsURL} className="text-indigo-500">
                terms of service
              </a>
              .
            </Text>
          )}
        </div>

        <div className="mt-14 flex justify-center items-center space-x-2">
          <img src={subtractLogo} alt="powered by rollup.id" />
          <Text size="xs" weight="normal" className="text-gray-400">
            Powered by{' '}
            <a href="https://rollup.id" className="hover:underline">
              rollup.id
            </a>
          </Text>
          <TosAndPPol />
        </div>
      </div>
    </div>
  )
}
