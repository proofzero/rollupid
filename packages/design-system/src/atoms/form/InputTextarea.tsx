import { useEffect, useState } from 'react'
import { Text } from '../text/Text'
import React from 'react'

export type InputTextareaProps = {
  id?: string
  heading: string
  onChange?: (val: any) => void
  rows?: number
  charLimit?: number
  name?: string
  placeholder?: string
  defaultValue?: string
  disabled?: boolean
  error?: boolean
  required?: boolean
}

const InputTextarea = ({
  id,
  onChange,
  rows,
  heading,
  charLimit,
  name,
  placeholder,
  defaultValue,
  disabled,
  error,
  required,
}: InputTextareaProps) => {
  const computedName = name ?? id

  const [val, setVal] = useState<undefined | string>(defaultValue)
  const [computedError, setComputedError] = useState<undefined | boolean>()

  useEffect(() => {
    if (error || (val && charLimit && val.length > charLimit)) {
      setComputedError(true)
    } else {
      setComputedError(false)
    }
  }, [error, val])

  return (
    <div>
      <label htmlFor={id} className="flex flex-row justify-between">
        <Text size="sm" weight="medium" color={error ? '#EF4444' : '#374151'}>
          {heading}
        </Text>

        {charLimit && (
          <Text size="sm" weight="medium" className="text-gray-400">
            {val?.length || 0}/{charLimit}
          </Text>
        )}
      </label>

      <div className="mt-1 text-base flex">
        <div
          className={`relative ${
            computedError ? 'text-red-900' : 'text-gray-900'
          } flex flex-1`}
        >
          <textarea
            name={computedName}
            id={id}
            onChange={(e) => {
              setVal(e.target.value)

              if (onChange) onChange(e.target.value)
            }}
            rows={rows}
            defaultValue={defaultValue}
            disabled={disabled ?? false}
            className={`${
              computedError ? 'border-red-500' : 'border-gray-300'
            } shadow-sm ${
              computedError ? 'focus:border-red-500' : 'focus:border-indigo-500'
            } ${
              computedError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
            } disabled:cursor-not-allowed ${
              computedError
                ? 'disabled:border-red-200'
                : 'disabled:border-gray-200'
            } ${computedError ? 'disabled:bg-red-50' : 'disabled:bg-gray-50'} ${
              computedError ? 'placeholder-red-400' : 'placeholder-gray-400'
            } w-full rounded-md`}
            placeholder={placeholder}
            required={required}
          />
        </div>
      </div>
    </div>
  )
}

export default InputTextarea
