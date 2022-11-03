import React, { ReactNode } from 'react';
import { Button } from '@kubelt-ui/threeid.ui.button';
import threeidSVG from './threeid.svg';

export type LoginButtonProps = {
  href: string;
};

export function LoginButton({ href }: LoginButtonProps) {
  return (
    <Button href={href} style={{ minWidth: 220, minHeight: 50 }}>
      <img style={{ marginRight: 7 }} src={threeidSVG} />
      Private Login
    </Button>
  );
}
