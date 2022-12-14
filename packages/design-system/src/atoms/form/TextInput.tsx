import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
}

export const TextInput = ({
  id,
  name,
  label,
  className,
  ...rest
}: TextInputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col">
      <label htmlFor={id}>
        <Text size="sm" weight="medium" className="text-gray-700 mb-2">
          {label}
        </Text>
      </label>

      <input
        type="text"
        className={`w-full form-input rounded border border-gray-300 shadow-sm text-sm text-gray-900 font-normal py-2 px-3 ${className}`}
        id={id}
        name={computedName}
        {...rest}
      />
    </div>
  )
}
