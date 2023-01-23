import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
}

export const Input = ({
  id,
  name,
  label,
  className,
  error,
  ...rest
}: InputProps) => {
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
        className={`w-full form-input rounded border
         shadow-sm text-sm font-normal py-2 px-3 ${className}
         ${
           error
             ? 'text-red-400 border-red-500'
             : 'border-gray-300 text-gray-900'
         } 
         ${error ? 'focus:border-red-500' : 'focus:border-indigo-500'}${
          error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
        } disabled:cursor-not-allowed ${
          error ? 'disabled:border-red-200' : 'disabled:border-gray-200'
        } ${error ? 'disabled:bg-red-50' : 'disabled:bg-gray-50'} ${
          error ? 'placeholder-red-400' : 'placeholder-gray-400'
        }`}
        id={id}
        name={computedName}
        {...rest}
      />
    </div>
  )
}
