import React, { ButtonHTMLAttributes, useContext } from 'react'
import classNames from 'classnames'
import {
  ButtonSize,
  ButtonType,
  disabledColorClasses,
  sizeToSizesDict,
  typeToColorsDict,
} from './common'

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  btnSize?: ButtonSize
  btnType?: ButtonType
  isSubmit?: boolean
  onClick?: (e?: any) => unknown
  disabled?: boolean
  className?: string
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
