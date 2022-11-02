import React, { ReactNode } from 'react';
import classNames from 'classnames';
import {
  Button as TeambitButton,
  ButtonProps as TeambitButtonProps,
} from '@teambit/design.ui.buttons.button';
import styles from './button.module.scss';

export type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonProps = {
  disabled?: boolean;

  size?: Sizes;

  children?: ReactNode;
} & TeambitButtonProps;

export function Button({
  children,
  className,
  secondary,
  disabled,
  size,
  ...rest
}: ButtonProps) {
  const secondaryClass = secondary ? styles.secondary : styles.primary;
  const disabledClass = disabled ? styles.disabled : '';
  const sizeClass = size ? styles[size] : styles.md;

  return (
    <TeambitButton
      {...rest}
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
