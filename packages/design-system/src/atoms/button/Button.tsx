import React, { ReactNode } from 'react'
import classNames from 'classnames'

import styles from './Button.module.css'

export type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = {
  disabled?: boolean
  alt?: boolean
  secondary?: boolean
  tertiary?: boolean
  size?: Sizes
  className?: string
  children?: ReactNode
  onClick?: () => void
}

export function Button({
  disabled,
  alt,
  secondary,
  tertiary,
  size,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const altClass = alt ? styles.alt : styles.primary
  const secondaryClass = secondary ? styles.secondary : styles.primary
  const tertiaryClass = tertiary ? styles.tertiary : styles.primary
  const disabledClass = disabled ? styles.disabled : null
  const sizeClass = size ? styles[size] : styles.md
  return (
    <button
      disabled={disabled}
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
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
