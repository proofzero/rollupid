import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type PreLabeledInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  preLabel: string | JSX.Element
}

export const PreLabeledInput = ({
  id,
  name,
  label,
  preLabel,
  className,
  ...rest
}: PreLabeledInputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col">
      <label htmlFor={id}>
        <Text size="sm" weight="medium" className="text-gray-700 mb-2">
          {label}
          {rest.required ? '*' : ''}
        </Text>
      </label>

      <div
        className={`bg-gray-50 flex flex-row items-center w-full rounded shadow-sm border border-gray-300`}
      >
        <Text
          type="span"
          size="sm"
          weight="normal"
          className="rounded-l border-r border-gray-300 py-2 px-3 bg-gray-50 text-gray-500 h-full"
        >
          {preLabel}
        </Text>
        <input
          className={`flex-1 border-none rounded-r form-input text-sm text-gray-900 font-normal ${className}`}
          id={id}
          name={computedName}
          {...rest}
        />
      </div>
    </div>
  )
}
