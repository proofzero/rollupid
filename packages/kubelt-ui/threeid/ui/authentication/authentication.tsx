import React, { ReactNode, useState } from 'react';
import { Button } from '@kubelt-ui/threeid.ui.button';
import { BaseTheme } from '@kubelt-ui/threeid.themes.base-theme';
import classNames from 'classnames';

import { WagmiConfig, createClient } from 'wagmi';
import { getDefaultProvider } from 'ethers';

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
  provider?: any;
  socialLoginProviders?: SocialLoginProviders[];
};

export function Authentication({ provider }: AuthenticationProps) {
  const [error, setError] = useState<Error | null>(null);
  const client = createClient({
    autoConnect: false,
    provider: provider || getDefaultProvider(),
  });

  function errorCallback(error: Error) {
    setError(error);
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
