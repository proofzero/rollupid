import React, { ReactNode } from 'react';
import classNames from 'classnames';

import {
  Button as TeambitButton,
  ButtonProps as TeambitButtonProps,
} from '@teambit/design.ui.buttons.button';
import styles from './button.module.scss';
// import { interFont } from '@kubelt/threeid.themes.base-theme/inter-font';

export type ButtonProps = {
  secondary?: boolean;

  disabled?: boolean;

  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  children?: ReactNode;
} & TeambitButtonProps;

export function Button({
  children,
  className,
  secondary,
  disabled,
  size,
}: ButtonProps) {
  const secondaryClass = secondary ? styles.secondary : styles.primary;
  const disabledClass = disabled ? styles.disabled : '';
  const sizeClass = size ? styles[size] : styles.md;
  return (
    <TeambitButton
      disabled
      className={classNames(
        styles.base,
        className,
        secondaryClass,
        disabledClass,
        sizeClass
      )}
    >
      {children}
    </TeambitButton>
  );
}
