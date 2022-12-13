import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Text } from '../text/Text'

export type ReadOnlyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  value: string
  label: string
  hidden?: boolean
}

export const ReadOnlyInput = ({
  hidden = false,
  label,
  id,
  name,
  readOnly,
  value,
  className,
  ...rest
}: ReadOnlyInputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col">
      <label htmlFor={id}>
        <Text size="sm" weight="medium" className="text-gray-700 mb-2">
          {label}
        </Text>
      </label>

      {/* Would `disabled` also work instead of overwriting focus properties ?*/}
      <input
        type={hidden ? 'password' : 'text'}
        className={`form-input rounded border border-gray-300 shadow-sm bg-gray-100 text-sm text-gray-500 font-normal py-2 px-3 focus:outline-none focus:border-gray-300 focus:ring-0 ${className}`}
        id={id}
        name={computedName}
        readOnly
        {...rest}
        value={value}
      />
    </div>
  )
}
