import React, { ButtonHTMLAttributes, useContext } from 'react'
import classNames from 'classnames'
import {
  ButtonSize,
  ButtonType,
  disabledColorClasses,
  sizeToSizesDict,
  typeToColorsDict,
} from './common'
import { ThemeContext } from '../../contexts/theme'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  btnSize?: ButtonSize
  btnType?: ButtonType
  isSubmit?: boolean
  onClick?: () => unknown
}

export function Button({
  disabled,
  btnSize = 'base',
  btnType = 'primary',
  isSubmit,
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const sizeClasses: string = sizeToSizesDict[btnSize]
  const colorClasses: string = typeToColorsDict[btnType]

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        sizeClasses,
        disabled ? disabledColorClasses : colorClasses,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
