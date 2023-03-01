import circleLogo from './circle-logo.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import ConnectOAuthButton from '../connect-oauth-button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { lazy } from 'react'
import { Avatar } from '@kubelt/design-system'

const ConnectButton = lazy(() =>
  import('../../../app/components/connect-button/ConnectButton').then(
    (module) => ({ default: module.ConnectButton })
  )
)

export type AuthenticationProps = {
  logoURL?: string
  appName?: string
  enableWalletConnect: boolean
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
}

export function Authentication({
  logoURL,
  appName,
  enableWalletConnect = true,
  connectCallback,
  connectErrorCallback,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div
      className={
        'flex flex-col items-center justify-center gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[598px] w-full lg:w-[418px] lg:border-rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      <Avatar src={logo} size="sm"></Avatar>
      <div className={'flex flex-col items-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>
          {appName ? `Login to ${appName}` : 'Welcome to the Private Web'}
        </h1>
        <h2 style={{ color: '#6B7280' }} className={'font-medium text-base'}>
          How would you like to continue?
        </h2>
      </div>
      <ConnectButton
        disabled={!enableWalletConnect}
        connectCallback={connectCallback}
        connectErrorCallback={connectErrorCallback}
      />
      <div className="my-5 flex flex-row items-center space-x-3">
        <hr className="h-px w-16 bg-gray-500" />
        <Text>or</Text>
        <hr className="h-px w-16 bg-gray-500" />
      </div>

      <div className="flex flex-row space-x-3 justify-evenly w-full">
        <ConnectOAuthButton provider="google" />
        <ConnectOAuthButton provider="microsoft" />
        <ConnectOAuthButton provider="apple" />
      </div>

      <div className="flex flex-row space-x-3 justify-evenly w-full">
        <ConnectOAuthButton provider="twitter" />
        <ConnectOAuthButton provider="discord" />
        <ConnectOAuthButton provider="github" />
      </div>

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
  )
}
