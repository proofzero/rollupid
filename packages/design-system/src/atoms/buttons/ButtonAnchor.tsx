import React, { AnchorHTMLAttributes } from 'react'
import classNames from 'classnames'
import {
  ButtonSize,
  ButtonType,
  sizeToSizesDict,
  typeToColorsDict,
} from './common'

export type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  btnSize?: ButtonSize
  btnType?: ButtonType
}

export function ButtonAnchor({
  href,
  btnSize = 'base',
  btnType = 'primary',
  className,
  children,
  ...rest
}: ButtonAnchorProps) {
  const sizeClasses: string = sizeToSizesDict[btnSize]
  const colorClasses: string = typeToColorsDict[btnType]

  return (
    <a
      href={href}
      className={classNames(sizeClasses, colorClasses, className)}
      {...rest}
    >
      {children}
    </a>
  )
}
