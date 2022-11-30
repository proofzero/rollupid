import React, { ReactNode, useState, useEffect } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system'
import type { ButtonProps } from '@kubelt/design-system'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import type { LinksFunction } from '@remix-run/cloudflare'
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultClient,
} from 'connectkit'

import walletsSvg from './wallets.svg'
import styles from './ConnectButton.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

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
              btnType="secondary"
              className={classNames('button', className)}
              disabled={isConnecting}
              onClick={show}
            >
              <span className={classNames('icon')}>
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
