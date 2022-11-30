import React, { ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'
import { Text } from '../text/Text'

// Strings used so no other
// constructs need to be exported
type ButtonSize = 'xs' | 'sm' | 'base' | 'l' | 'xl'
type ButtonType = 'primary' | 'primary-alt' | 'secondary' | 'secondary-alt'

// Dictionary pattern used
// so Tailwind can find the needed classes
const sizeToSizesDict = {
  xs: 'min-w-[4rem] py-[7px] px-[11px] font-medium text-xs rounded',
  sm: 'min-w-[5rem] py-[9px] px-[13px] font-medium text-sm rounded-md',
  base: 'min-w-[6rem] py-[9px] px-[17px] font-medium text-sm rounded-md',
  l: 'min-w-[7rem] py-[9px] px-[17px] font-medium text-base rounded-md',
  xl: 'min-w-[8rem] py-[13px] px-[25px] font-medium text-base rounded-md',
}

const typeToColorsDict = {
  primary:
    'bg-[#1f2937] text-white shadow-sm hover:bg-[#374151] focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  'primary-alt':
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  secondary:
    'bg-white text-[#5d4aec] shadow-sm border border-solid border-gray-300 hover:bg-gray-300 focus:bg-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
  'secondary-alt':
    'bg-white text-[#1f2937] shadow-sm border border-solid border-gray-300 hover:bg-gray-300 focus:bg-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500',
}

const disabledColorClasses = 'bg-gray-100 text-gray-300'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  btnSize?: ButtonSize
  btnType?: ButtonType
}

export function Button({
  disabled,
  btnSize = 'base',
  btnType = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  const sizeClasses: string = sizeToSizesDict[btnSize]
  const colorClasses: string = typeToColorsDict[btnType]

  return (
    <button
      disabled={disabled}
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
