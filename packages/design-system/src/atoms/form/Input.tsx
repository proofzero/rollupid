import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
}

export const Input = ({ id, name, label, className, ...rest }: InputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col">
      <label htmlFor={id}>
        <Text size="sm" weight="medium" className="text-gray-700 mb-2">
          {label}
          {rest.required ? '*' : ''}
        </Text>
      </label>

      <input
        className={`w-full form-input rounded border border-gray-300 shadow-sm text-sm text-gray-900 font-normal py-2 px-3 ${className}`}
        id={id}
        name={computedName}
        {...rest}
      />
    </div>
  )
}
