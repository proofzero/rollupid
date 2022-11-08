import React, { ReactNode } from 'react';
import { Button } from '@kubelt-ui/threeid.ui.button';
import { BaseTheme } from '@kubelt-ui/threeid.themes.base-theme';
import classNames from 'classnames';

import { WagmiConfig, createClient } from 'wagmi';
import { getDefaultProvider, Provider } from 'ethers';

import { ConnectButton } from './connect-button';

import styles from './authentication.module.scss';

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
  provider: Provider;
  socialLoginProviders: SocialLoginProviders[];
};

export function Authentication({ provider }: AuthenticationProps) {
  console.log('provider', provider);
  const client = createClient({
    autoConnect: false,
    provider: provider,
  });

  return (
    <BaseTheme>
      <WagmiConfig client={client}>
        <ConnectButton
          className={classNames(styles.button)}
          tertiary
          disabled={!provider}
        >
          <span
            className={classNames(styles.icon, styles.walletIcon)}
            onClick={() => null}
          />
          Connect with Wallet
        </ConnectButton>
      </WagmiConfig>
      <Button className={classNames(styles.button)} tertiary>
        <span className={classNames(styles.icon, styles.emailIcon)} />
        Connect with Email
      </Button>
    </BaseTheme>
  );
}
