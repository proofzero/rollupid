import React from 'react';
import { Authentication, SocialLoginProviders } from './authentication';

export const BasicAuthentication = () => {
  return (
    <Authentication socialLoginProviders={[SocialLoginProviders.GOOGLE]} />);
}
