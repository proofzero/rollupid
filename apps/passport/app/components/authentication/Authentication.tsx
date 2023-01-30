import circleLogo from './circle-logo.svg'
import kubeltLogoSmall from './kubelt.svg'

import ConnectOAuthButton from '../connect-oauth-button'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { lazy, Suspense } from 'react'

const ConnectButton = lazy(() =>
  import('../../../app/components/connect-button/ConnectButton').then(
    (module) => ({ default: module.ConnectButton })
  )
)

export type AuthenticationProps = {
  logoURL?: string
  enableWalletConnect: boolean
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
}

export function Authentication({
  logoURL,
  enableWalletConnect = true,
  connectCallback,
  connectErrorCallback,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div
      className={
        'flex flex-col items-center justify-center gap-4 basis-96 m-auto bg-white p-6'
      }
      style={{
        width: 418,
        height: 598,
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        borderRadius: 8,
      }}
    >
      <div className={''}>
        <img className={''} src={logo} alt="3ID Logo" />
      </div>
      <div className={'flex flex-col items-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>Welcome to the Private Web</h1>
        <h2 style={{ color: '#6B7280' }} className={'font-medium text-base'}>
          How would you like to continue?
        </h2>
      </div>
      <Suspense>
        <ConnectButton
          disabled={!enableWalletConnect}
          connectCallback={connectCallback}
          connectErrorCallback={connectErrorCallback}
        />
      </Suspense>
      <div className="my-5 flex flex-row items-center space-x-3">
        <hr className="h-px w-16 bg-gray-500" />
        <Text>or</Text>
        <hr className="h-px w-16 bg-gray-500" />
      </div>

      <div className="flex flex-row space-x-3 justify-evenly w-full">
        <ConnectOAuthButton provider="google" />
        <ConnectOAuthButton provider="apple" />
      </div>

      <div className="flex flex-row space-x-3 justify-evenly w-full">
        <ConnectOAuthButton provider="twitter" />
        <ConnectOAuthButton provider="github" />
        <ConnectOAuthButton provider="microsoft" />
      </div>

      <div className="mt-14 flex justify-center items-center space-x-2">
        <img className="w-4 h-4" src={kubeltLogoSmall} />
        <Text size="xs" weight="normal" className="text-gray-400">
          Powered by rollup.id
        </Text>
      </div>
    </div>
  )
}
