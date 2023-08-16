import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label?: string
  error?: string
  docsUrl?: string
  skin?: boolean
}

export const Input = ({
  id,
  name,
  label,
  className,
  error,
  docsUrl,
  onSeeking,
  skin,
  ...rest
}: InputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={id}
          className="w-full flex flex-row items-center justify-between"
        >
          <Text
            size="sm"
            weight="medium"
            className="text-gray-700 dark:text-gray-400 mb-2"
          >
            {label}
            {rest.required ? '*' : ''}
          </Text>
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-500 mb-2 text-sm"
            >
              Learn More
            </a>
          )}
        </label>
      )}

      <input
        className={`w-full form-input rounded-lg border
         shadow-sm text-sm font-normal py-2 px-3 ${className}
         ${error ? ' border-red-500' : 'border-gray-300'}
         ${
           error
             ? 'focus:border-red-500'
             : skin
             ? 'focus:border-skin-primary'
             : 'focus:border-indigo-500'
         } disabled:cursor-not-allowed ${
          error ? 'disabled:border-red-200' : 'disabled:border-gray-200'
        } ${
          error ? 'disabled:bg-red-50' : 'disabled:bg-gray-50'
        } placeholder-gray-400 text-gray-900 dark:text-gray-50 dark:bg-gray-800 focus:ring-none`}
        id={id}
        name={computedName}
        {...rest}
      />
    </div>
  )
}
