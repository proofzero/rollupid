import { lazy } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.png'
import { Avatar } from 'connectkit'

const ConnectKitProvider = lazy(() =>
  import('connectkit').then((module) => ({
    default: module.ConnectKitProvider,
  }))
)

const CustomConnectKitButton = lazy(() =>
  import('connectkit').then((module) => ({
    default: module.ConnectKitButton.Custom,
  }))
)

export type ConnectButtonProps = {
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
  disabled?: boolean
  provider?: string
  className?: string
} & ButtonProps

export function ConnectButton({
  connectCallback,
  className,
}: ConnectButtonProps) {
  return (
    <ConnectKitProvider>
      <CustomConnectKitButton>
        {({
          isConnected,
          isConnecting,
          show,
          hide,
          address,
          truncatedAddress,
          ensName,
        }) => {
          return (
            <Button
              btnType="secondary-alt"
              className={classNames('button', className)}
              disabled={isConnected ? !address : isConnecting}
              onClick={
                isConnected ? () => address && connectCallback(address) : show
              }
              style={{
                height: 50,
                width: '100%',
                fontSize: 16,
                fontWeight: 500,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {ensName && (
                <span className="mr-[7px]">
                  <Avatar size={20} name={ensName} />
                </span>
              )}

              {!ensName && (
                <span
                  style={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '100%',
                    height: 20,
                    width: 20,
                    margin: '0 7px',
                  }}
                >
                  <img src={walletsSvg} />
                </span>
              )}

              {isConnected && address
                ? `Login with ${ensName ?? truncatedAddress}`
                : !isConnecting
                ? 'Connect Wallet'
                : 'Connecting'}
            </Button>
          )
        }}
      </CustomConnectKitButton>
    </ConnectKitProvider>
  )
}
