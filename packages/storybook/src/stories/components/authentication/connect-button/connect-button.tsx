import React, { ReactNode, useEffect, useState } from 'react'
import { Button, ButtonProps } from '../../../modules/button/Button'
import classNames from 'classnames'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

// import styles from './authentication.module.scss';

export type ConnectButtonProps = {
  errorCallback: (error: Error) => void
} & ButtonProps

export function ConnectButton({
  errorCallback,
  className,
  children,
  ...rest
}: ConnectButtonProps) {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      connector: new InjectedConnector(),
    })
  const { disconnect } = useDisconnect()

  const { address, isConnected, status } = useAccount()

  useEffect(() => {
    if (isConnected) {
      console.log('Connected to wallet', address)
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
      {status}
      <Button
        className={classNames(className)}
        // tertiary
        disabled={status !== 'disconnected'}
        onPress={() => {
          connect()
        }}
        {...rest}
      >
        {children}
      </Button>
    </>
  )
}
