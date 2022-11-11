import React, { ReactNode, useRef } from 'react'
import classNames from 'classnames'
import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
} from '@teambit/base-react.buttons.button'

import styles from './button.module.scss'

export type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = {
  disabled?: boolean

  alt?: boolean

  secondary?: boolean
  tertiary?: boolean

  size?: Sizes

  className?: string

  children?: ReactNode
} & BaseButtonProps

export function Button({
  children,
  className,
  alt,
  secondary,
  tertiary,
  disabled,
  size,
  ...rest
}: ButtonProps) {
  const altClass = alt ? styles.alt : styles.primary
  const secondaryClass = secondary ? styles.secondary : styles.primary
  const tertiaryClass = tertiary ? styles.tertiary : ''
  const disabledClass = disabled ? styles.disabled : ''
  const sizeClass = size ? styles[size] : styles.md

  return (
    <BaseButton
      {...rest}
      disabled
      className={classNames(
        styles.button,
        styles.base,
        className,
        altClass,
        secondaryClass,
        tertiaryClass,
        disabledClass,
        sizeClass
      )}
    >
      {children}
    </BaseButton>
  )
}
