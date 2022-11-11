import React, { ReactNode, useEffect } from 'react'
import { Button, ButtonProps } from '../../../atoms/button/Button'
import classNames from 'classnames'

import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi'

function deconstructConnectors(connectors: Connector<any, any, any>[]) {
  return {
    injectedConnector: connectors.find((c) => c.id === 'injected'),
    wcConnector: connectors.find((c) => c.id === 'walletConnect'),
  }
}

export type ConnectButtonHandlerProps = {
  errorCallback: (error: Error) => void
  connectCallback: (address: string) => void
} & ButtonProps

export function ConnectButtonHandler({
  errorCallback,
  connectCallback,
  className,
  children,
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
        {children}
      </Button>
    </>
  )
}
