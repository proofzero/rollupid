import React, { ReactNode } from 'react';
import { Button as TeambitButton } from '@teambit/design.ui.buttons.button';
export type ButtonProps = {
  /**
   * a node to be rendered in the special component.
   */
  children?: ReactNode;
};

export function Button({ children }: ButtonProps) {
  return <TeambitButton>{children}</TeambitButton>;
}
