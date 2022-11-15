import React, { ReactNode, useRef } from 'react'
import classNames from 'classnames'

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
  const tertiaryClass = tertiary ? styles.tertiary : ''
  const disabledClass = disabled ? styles.disabled : ''
  const sizeClass = size ? styles[size] : styles.md

  console.log('onClick is', onClick)
  return (
    <button
      {...rest}
      disabled={disabled}
      className={classNames(
        'fixed',
        'right-0',
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
    >
      {children}
    </button>
  )
}
