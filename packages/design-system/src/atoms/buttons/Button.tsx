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
}

export function Button({
  disabled,
  btnSize = 'base',
  btnType = 'primary',
  isSubmit,
  className,
  children,
  ...rest
}: ButtonProps) {
  const { theme, dark } = useContext(ThemeContext)

  const sizeClasses: string = sizeToSizesDict[btnSize]
  const colorClasses: string = typeToColorsDict[btnType]

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      disabled={disabled}
      className={classNames(
        sizeClasses,
        disabled ? disabledColorClasses : colorClasses,
        className
      )}
      style={{
        color: theme?.color
          ? dark
            ? theme.color.dark
            : theme.color.light
          : '#6366F1',
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
