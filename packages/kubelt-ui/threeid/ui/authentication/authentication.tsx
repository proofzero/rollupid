import React, { ReactNode } from 'react';
import { Button } from '@kubelt-ui/threeid.ui.button';

export enum SocialLoginProviders {
  GOOGLE = 1,
}
// GOOGLE = 1,
// TWITTER = 2,
// DISCORD = 3,
// FACEBOOK = 4,
// APPLE = 5,

export type AuthenticationProps = {
  socialLoginProviders: SocialLoginProviders[];
};

export function Authentication({}: AuthenticationProps) {
  return (
    <div>
      <Button tertiary>
        <span id="wallets-icon" />
        Connect with Wallet
      </Button>
      <Button tertiary disabled>
        Connect with Email
      </Button>
    </div>
  );
}
