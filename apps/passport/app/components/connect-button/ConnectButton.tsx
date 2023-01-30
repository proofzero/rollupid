import { lazy } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.svg'

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
  disabled = false,
  connectCallback,
  connectErrorCallback,
  provider,
  className,
  ...rest
}: ConnectButtonProps) {
  return (
    <ConnectKitProvider>
      <CustomConnectKitButton>
        {({ isConnected, isConnecting, show, hide, address, ensName }) => {
          if (isConnected && address) {
            connectCallback(address)
          }

          return (
            <Button
              btnType="secondary-alt"
              className={classNames('button', className)}
              disabled={isConnecting}
              onClick={show}
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
              {!isConnecting ? 'Connect With Wallet' : 'Connecting'}
            </Button>
          )
        }}
      </CustomConnectKitButton>
    </ConnectKitProvider>
  )
}
