import React from 'react'

import circleLogo from './circle-logo.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import { Text } from '../../atoms/text/Text'
import { Avatar } from '../../atoms/profile/avatar/Avatar'

export const AuthenticationConstants = {
  defaultLogoURL: circleLogo,
  defaultHeading: 'Welcome to the Private Web',
  defaultSubheading: 'How would you like to continue?',
}

export type AuthenticationProps = {
  logoURL?: string
  appName?: string
  heading?: string
  subheading?: string
  generic?: boolean
  accountSelect?: boolean
  children: JSX.Element
}

export default ({
  logoURL = AuthenticationConstants.defaultLogoURL,
  appName,
  heading = AuthenticationConstants.defaultHeading,
  subheading = AuthenticationConstants.defaultSubheading,
  generic = false,
  accountSelect = false,
  children,
}: AuthenticationProps) => {
  return (
    <div className="relative">
      <div
        className={`relative flex shrink grow-0 flex-col items-center gap-4 mx-auto bg-white p-6 min-h-[100dvh] lg:min-h-[675px] max-h-[100dvh] w-full lg:w-[418px] lg:rounded-lg overflow-auto`}
        style={{
          border: '1px solid #D1D5DB',
          boxSizing: 'border-box',
        }}
      >
        {generic && (
          <>
            <Text
              size="xl"
              weight="semibold"
              className="text-[#2D333A] mt-6 mb-8"
            >
              Connect Account
            </Text>
          </>
        )}

        {accountSelect && (
          <>
            <Avatar src={logoURL} size="sm"></Avatar>
            <div className={'flex flex-col items-center gap-2'}>
              <Text size="xl" weight="semibold">
                Choose an account
              </Text>

              {appName && (
                <Text className="text-gray-500">
                  to continue to "
                  <span className="text-indigo-500">{appName}</span>"
                </Text>
              )}
            </div>
          </>
        )}

        {!generic && !accountSelect && (
          <>
            <Avatar src={logoURL} size="sm"></Avatar>
            <div className={'flex flex-col items-center gap-2'}>
              <h1 className={'font-semibold text-xl'}>
                {appName ? `Login to ${appName}` : heading}
              </h1>
              <h2
                style={{ color: '#6B7280' }}
                className={'font-medium text-base'}
              >
                {subheading}
              </h2>
            </div>
          </>
        )}

        <div className="flex-1 w-full flex flex-col gap-4">{children}</div>

        <div className="mt-14 flex justify-center items-center space-x-2">
          <img src={subtractLogo} alt="powered by rollup.id" />
          <Text size="xs" weight="normal" className="text-gray-400">
            Powered by{' '}
            <a href="https://rollup.id" className="hover:underline">
              rollup.id
            </a>
          </Text>
        </div>
      </div>
    </div>
  )
}
