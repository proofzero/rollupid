import React, { useContext, useEffect, lazy } from 'react'

import circleLogo from './circle-logo.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import { Text } from '../../atoms/text/Text'

import ConnectOAuthButton, {
  OAuthProvider,
} from '../../atoms/buttons/connect-oauth-button'
import { AuthButton } from '../../molecules/auth-button/AuthButton'
import { HiOutlineMail } from 'react-icons/hi'
import { TosAndPPol } from '../../atoms/info/TosAndPPol'
import { ThemeContext } from '../../contexts/theme'

const ConnectButton = lazy(() =>
  import('../../atoms/buttons/connect-button/ConnectButton').then((module) => ({
    default: module.ConnectButton,
  }))
)

export const AuthenticationScreenDefaults = {
  defaultLogoURL: circleLogo,
  defaultHeading: 'Welcome to the Private Web',
  defaultSignMessage: `Welcome to Rollup!

  Sign this message to accept the Rollup Terms of Service (https://rollup.id/tos), no password needed!
  
  This will not trigger a blockchain transaction or cost any gas fees.
  
  {{nonce}}`,
  defaultSubheading: 'How would you like to continue?',
  knownKeys: [
    'wallet',
    'email',
    'google',
    'microsoft',
    'apple',
    'twitter',
    'discord',
    'github',
  ],
  color: {
    light: '#6366F1',
    dark: '#C6C7FF',
  },
  radius: 'md',
}

export type AuthenticationProps = {
  logoURL?: string
  displayKeys: string[]
  mapperArgs: DisplayKeyMapperArgs
  Header?: JSX.Element
  Actions?: JSX.Element
}

export default function Authentication({
  displayKeys,
  mapperArgs,
  Header,
  Actions,
}: AuthenticationProps) {
  displayKeys = displayKeys.filter((key) =>
    AuthenticationScreenDefaults.knownKeys.includes(key)
  )

  const { dark, theme } = useContext(ThemeContext)

  return (
    <div className={`relative ${dark ? 'dark' : ''}`}>
      <div
        className={`flex grow-0 flex-col items-center
         gap-4 mx-auto bg-white dark:bg-[#1F2937] p-6 min-h-[100dvh] lg:min-h-[580px]
          max-h-[100dvh] w-full lg:w-[418px] lg:rounded-${
            theme?.radius ?? AuthenticationScreenDefaults.radius
          }
          mt-auto border border-[#D1D5DB] dark:border-gray-600`}
        style={{
          boxSizing: 'border-box',
        }}
      >
        {Header}

        <div className="flex-1 w-full flex flex-col gap-4 relative">
          {displayKeys.slice(0, 2).map((dk: OAuthProvider) =>
            displayKeyMapper(dk, {
              flex: true,
              displayContinueWith: true,
              ...mapperArgs,
            })
          )}

          {displayKeys.length > 2 && (
            <>
              <div className="flex flex-row items-center">
                <div className="border-t border-gray-200 dark:border-gray-600 flex-1"></div>
                <Text className="px-3 text-gray-500" weight="medium">
                  or
                </Text>
                <div className="border-t border-gray-200 dark:border-gray-600 flex-1"></div>
              </div>
              {displayKeyDisplayFn(displayKeys.slice(2), mapperArgs)}
            </>
          )}

          {Actions && <div className="flex flex-1 items-end">{Actions}</div>}
        </div>

        <div className="flex justify-center items-center space-x-2">
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

type DisplayKeyMapperArgs = {
  clientId: string
  signData: any
  walletConnectCallback?: (address: string) => void
  walletSignCallback?: (
    address: string,
    signature: string,
    nonce: string,
    state: string
  ) => void
  walletConnectErrorCallback?: (error: Error) => void
  navigate?: (URL: string) => void
  authnQueryParams: string
  loading?: boolean
  flex?: boolean
  displayContinueWith?: boolean
  enableOAuthSubmit?: boolean
  signMessageTemplate: string
}
const displayKeyMapper = (
  key: string,
  {
    clientId,
    signData,
    walletConnectCallback = () => {},
    walletSignCallback = () => {},
    walletConnectErrorCallback = () => {},
    navigate = () => {},
    authnQueryParams,
    loading = false,
    flex = false,
    displayContinueWith = false,
    enableOAuthSubmit = false,
    signMessageTemplate,
  }: DisplayKeyMapperArgs
) => {
  let el
  switch (key) {
    case 'wallet':
      el = (
        <ConnectButton
          key={key}
          signData={signData}
          isLoading={loading}
          fullSize={flex}
          displayContinueWith={displayContinueWith}
          connectCallback={walletConnectCallback}
          connectErrorCallback={walletConnectErrorCallback}
          signCallback={walletSignCallback}
          signMessageTemplate={signMessageTemplate}
        />
      )
      break
    case 'email':
      el = (
        <AuthButton
          key={key}
          onClick={() => navigate(`/authenticate/${clientId}/email`)}
          Graphic={<HiOutlineMail className="w-full h-full dark:text-white" />}
          text={'Email'}
          fullSize={flex}
          displayContinueWith={displayContinueWith}
        />
      )
      break
    default:
      el = (
        <ConnectOAuthButton
          provider={key as OAuthProvider}
          fullSize={flex}
          displayContinueWith={displayContinueWith}
          onClick={() => {
            const search = authnQueryParams ? `?${authnQueryParams}` : ''
            window.location.href = `/connect/${key}${search}`
          }}
        />
      )
  }

  return (
    <div
      key={key}
      className={`w-full min-w-0 ${displayContinueWith ? 'relative' : ''}`}
    >
      {el}
    </div>
  )
}

const displayKeyDisplayFn = (
  displayKeys: string[],
  mapperArgs: DisplayKeyMapperArgs
): JSX.Element[] => {
  const rows = []

  if (displayKeys.length === 1) {
    rows.push(displayKeyMapper(displayKeys[0], { flex: true, ...mapperArgs }))
  }

  if (displayKeys.length === 2) {
    rows.push(
      displayKeys.map((dk) =>
        displayKeyMapper(dk, { flex: true, ...mapperArgs })
      )
    )
  }

  if (displayKeys.length === 3) {
    rows.push(displayKeys.map((dk) => displayKeyMapper(dk, { ...mapperArgs })))
  }

  if (displayKeys.length === 4) {
    rows.push(
      displayKeys
        .slice(0, 2)
        .map((dk) => displayKeyMapper(dk, { flex: true, ...mapperArgs }))
    )
    rows.push(
      displayKeys
        .slice(2, 4)
        .map((dk) => displayKeyMapper(dk, { flex: true, ...mapperArgs }))
    )
  }

  if (displayKeys.length === 5) {
    rows.push(
      displayKeys
        .slice(0, 2)
        .map((dk) => displayKeyMapper(dk, { flex: true, ...mapperArgs }))
    )
    rows.push(
      displayKeys
        .slice(2, 5)
        .map((dk) => displayKeyMapper(dk, { ...mapperArgs }))
    )
  }

  if (displayKeys.length === 6) {
    rows.push(
      displayKeys
        .slice(0, 3)
        .map((dk) => displayKeyMapper(dk, { ...mapperArgs }))
    )
    rows.push(
      displayKeys
        .slice(3, 6)
        .map((dk) => displayKeyMapper(dk, { ...mapperArgs }))
    )
  }

  if (displayKeys.length > 6) {
    const firstHalf = displayKeys.slice(0, Math.ceil(displayKeys.length / 2))
    const secondHalf = displayKeys.slice(
      Math.ceil(displayKeys.length / 2),
      displayKeys.length
    )
    return [
      ...displayKeyDisplayFn(firstHalf, mapperArgs),
      ...displayKeyDisplayFn(secondHalf, mapperArgs),
    ]
  }

  return rows.map((row, i) => (
    <div
      key={`${displayKeys.join('_')}_${i}`}
      className="flex flex-row justify-evenly gap-4 relative"
    >
      {row}
    </div>
  ))
}
