import React, { ReactNode, useState, useEffect } from 'react'
import { Button, ButtonProps } from '../../atoms/button/Button'

import classNames from 'classnames'

import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi'

// import { ConnectButton } from './connect-button'

import styles from './connect-button.module.scss'

function deconstructConnectors(connectors: Connector<any, any, any>[]) {
  return {
    injectedConnector: connectors.find((c) => c.id === 'injected'),
    wcConnector: connectors.find((c) => c.id === 'walletConnect'),
  }
}

export type ConnectButtonHandlerProps = {
  connectCallback: (address: string) => void
  errorCallback: (error: Error) => void
  className?: string
} & ButtonProps

export function ConnectButtonWrapper({
  errorCallback,
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
      console.log('Connected to wallet', address)
      connectCallback(address)
    }
  }, [isConnected])

  useEffect(() => {
    if (error) {
      errorCallback(error)
    }
    disconnect()
  }, [error])

  return (
    <>
      {/* {status} */}
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
        <span className={classNames(styles.icon, styles.walletIcon)} />
        Connect With Wallet
      </Button>
    </>
  )
}

export type ConnectButtonProps = {
  connectCallback: (address: string) => void
  errorCallback: (error: Error) => void
}

export function ConnectButton({
  connectCallback,
  errorCallback,
  ...rest
}: ConnectButtonProps) {
  // TODO: what to do with errors?
  const [error, setError] = useState<Error | null>(null)

  // Setup client for connecting to wallets
  const { chains, provider, webSocketProvider } = configureChains(
    defaultChains,
    [publicProvider()] // TODO: add non default provider selection via props
  )

  const client = createClient({
    autoConnect: false,
    connectors: [
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
    ],
    provider,
    webSocketProvider,
  })

  return (
    <>
      {/* {status} */}
      {error && <div>{error.message}</div>}
      <WagmiConfig client={client}>
        <ConnectButtonWrapper
          className={classNames(styles.button)}
          tertiary
          connectCallback={connectCallback}
          errorCallback={errorCallback}
          {...rest}
        />
      </WagmiConfig>
    </>
  )
}
