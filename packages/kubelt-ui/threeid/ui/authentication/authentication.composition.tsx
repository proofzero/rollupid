import React from 'react';
import { Authentication, SocialLoginProviders } from './authentication';
import { getDefaultProvider } from 'ethers';

export const BasicAuthentication = () => {
  return (
    <Authentication
      provider={getDefaultProvider()}
      socialLoginProviders={[SocialLoginProviders.GOOGLE]}
    />
  );
};
