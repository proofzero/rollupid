import React from 'react'
import { InputHTMLAttributes } from 'react'
import { Copier } from '../copier/Copier'
import { Text } from '../text/Text'

export type ReadOnlyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  value: string
  label?: string
  hidden?: boolean
  copyable?: boolean
  onCopy?: (value: string) => void
}

export const ReadOnlyInput = ({
  hidden,
  label,
  id,
  name,
  value,
  className,
  copyable = false,
  onCopy,
  ...rest
}: ReadOnlyInputProps) => {
  const computedName = name ?? id

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        {label && (
          <label htmlFor={id}>
            <Text size="sm" weight="medium" className="text-gray-700 mb-2">
              {label}
            </Text>
          </label>
        )}
        {copyable && <Copier value={value} onCopy={onCopy} />}
      </div>

      {/* Would `disabled` also work instead of overwriting focus properties ?*/}
      <div className="relative">
        <input
          type={hidden ? 'password' : 'text'}
          className={`w-full form-input rounded border border-gray-300 shadow-sm bg-gray-100 text-sm text-gray-500 font-normal py-2 px-3 focus:outline-none focus:border-gray-300 focus:ring-0 ${
            hidden ? 'pr-10' : ''
          } ${className}`}
          id={id}
          name={computedName}
          readOnly
          {...rest}
          value={value}
        />
      </div>
    </div>
  )
}
