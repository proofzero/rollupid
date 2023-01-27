import { useEffect } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'

import walletsSvg from './wallets.svg'

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
  const { disconnect } = useDisconnect()
  const { error } = useConnect()
  const { address, isConnected, isConnecting, isDisconnected, status } =
    useAccount()

  useEffect(() => {
    if (isConnected) {
      connectCallback(address)
    }
  }, [isConnected])

  useEffect(() => {
    if (error) {
      disconnect()
      connectErrorCallback(error)
    }
  }, [error])

  return (
    <ConnectKitProvider>
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, hide, address, ensName }) => {
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
      </ConnectKitButton.Custom>
    </ConnectKitProvider>
  )
}
