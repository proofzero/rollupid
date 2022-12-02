import React, { HTMLAttributes } from 'react'

import classNames from 'classnames'

type TextSize =
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
const textSizeDict: { [key in TextSize]: string } = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
}

type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
const textWeightDict: { [key in TextWeight]: string } = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

type TextType = 'p' | 'span'

export type TextProps = HTMLAttributes<
  HTMLParagraphElement | HTMLSpanElement
> & {
  size?: TextSize
  weight?: TextWeight
  type?: TextType
}

export const Text = ({
  size = 'base',
  weight = 'normal',
  type = 'p',
  className,
  children,
  ...rest
}: TextProps) => {
  return React.createElement(
    type,
    {
      className: classNames(
        textWeightDict[weight],
        textSizeDict[size],
        className
      ),
      ...rest,
    },
    children
  )
}
