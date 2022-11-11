import React, { ReactNode, useState } from 'react'
import { Button } from '../../modules/button/Button'
import { BaseTheme } from '../../themes/base-theme/BaseTheme'
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

import { ConnectButton } from './connect-button'

import styles from './authentication.module.scss'

export enum SocialLoginProviders {
  GOOGLE = 1,
}
// GOOGLE = 1,
// TWITTER = 2,
// DISCORD = 3,
// FACEBOOK = 4,
// APPLE = 5,
// ...

export type AuthenticationProps = {
  socialLoginProviders?: SocialLoginProviders[]
}

export function Authentication({ socialLoginProviders }: AuthenticationProps) {
  const [error, setError] = useState<Error | null>(null)

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

  function errorCallback(error: Error) {
    setError(error)
  }

  return (
    <BaseTheme>
      {error && <div>{error.message}</div>}
      <WagmiConfig client={client}>
        <ConnectButton
          className={classNames(styles.button)}
          tertiary
          errorCallback={errorCallback}
        >
          <span className={classNames(styles.icon, styles.walletIcon)} />
          Connect with Wallet
        </ConnectButton>
      </WagmiConfig>
      <Button className={classNames(styles.button)} tertiary>
        <span className={classNames(styles.icon, styles.emailIcon)} />
        Connect with Email
      </Button>
    </BaseTheme>
  )
}
