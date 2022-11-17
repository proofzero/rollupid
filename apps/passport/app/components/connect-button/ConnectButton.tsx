import React, { ReactNode, useState, useEffect } from 'react'
import classNames from 'classnames'
import { Button, ButtonProps } from '@kubelt/design-system'
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi'
import { LinksFunction } from '@remix-run/cloudflare'

import walletsSvg from './wallets.svg'
import styles from './ConnectButton.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

function deconstructConnectors(connectors: Connector<any, any, any>[]) {
  return {
    injectedConnector: connectors.find((c) => c.id === 'injected'),
    wcConnector: connectors.find((c) => c.id === 'walletConnect'),
  }
}

export type ConnectButtonHandlerProps = {
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
  className?: string
} & ButtonProps

export function ConnectButtonWrapper({
  connectErrorCallback,
  connectCallback,
  className,
  ...rest
}: ConnectButtonHandlerProps) {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  const { injectedConnector, wcConnector } = deconstructConnectors(connectors)

  const { disconnect } = useDisconnect()

  const { address, isConnected, status } = useAccount()

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
    <>
      <Button
        className={classNames(className)}
        disabled={status !== 'disconnected'}
        onClick={() => {
          if (injectedConnector.ready) {
            connect({ connector: injectedConnector })
          } else {
            connect({ connector: wcConnector })
          }
        }}
        {...rest}
      >
        <span className={classNames('icon')}>
          <img src={walletsSvg} />
        </span>
        {!pendingConnector || !isLoading ? 'Connect With Wallet' : 'Connecting'}
      </Button>
    </>
  )
}

export type ConnectButtonProps = {
  disabled?: boolean
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
}

export function ConnectButton({
  disabled = false,
  connectCallback,
  connectErrorCallback,
  ...rest
}: ConnectButtonProps) {
  // TODO: what to do with errors?
  const [error, setError] = useState<Error | null>(null)

  return (
    <>
      {/* {status} */}
      {error && <div>{error.message}</div>}
      <ConnectButtonWrapper
        className={classNames('button')}
        disabled={disabled}
        tertiary
        connectCallback={connectCallback}
        connectErrorCallback={connectErrorCallback}
        {...rest}
      />
    </>
  )
}
