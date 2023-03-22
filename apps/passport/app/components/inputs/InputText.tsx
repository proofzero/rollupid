import type { IconType } from 'react-icons/lib'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

type InputTextValType = string | number
type InputIconPosType = 'leading' | 'trailing'

export type InputTextProps = {
  id?: string
  heading: string
  onChange?: (val: any) => void
  name?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  defaultValue?: InputTextValType
  disabled?: boolean
  autoCompute?: boolean
  Icon?: IconType
  iconPosition?: InputIconPosType
  addon?: string
  error?: boolean
  required?: boolean
  maxChars?: number
}

const InputText = ({
  id,
  onChange,
  heading,
  name,
  type,
  placeholder,
  defaultValue,
  disabled,
  autoCompute = true,
  Icon,
  iconPosition,
  addon,
  error,
  required,
  maxChars,
}: InputTextProps) => {
  const computedName = name ?? id

  return (
    <div>
      <label htmlFor={id}>
        <Text size="sm" weight="medium" color={error ? '#EF4444' : '#374151'}>
          {heading}
        </Text>
      </label>

      <div className="mt-1 text-base flex">
        {addon && (
          <span
            className={`inline-flex items-center rounded-l-md border border-r-0 ${
              error ? 'border-red-500' : 'border-gray-300'
            } shadow-sm ${
              error ? 'focus:border-red-500' : 'focus:border-indigo-500'
            } ${
              error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
            } disabled:cursor-not-allowed ${
              error ? 'disabled:border-red-200' : 'disabled:border-gray-200'
            } ${error ? 'disabled:bg-red-50' : 'disabled:bg-gray-50'} ${
              error ? 'placeholder-red-400' : 'placeholder-gray-400'
            } bg-gray-50 px-3`}
          >
            <Text
              size="sm"
              weight="medium"
              color={error ? '#EF4444' : '#374151'}
            >
              {addon}
            </Text>
          </span>
        )}
        <div
          className={`relative ${
            error ? 'text-red-900' : 'text-gray-900'
          } flex flex-1`}
        >
          {Icon && (
            <div
              style={{
                // Seems to be a problem with the `pr-3` class not adding padding
                paddingRight: iconPosition === 'trailing' ? '0.75rem' : 0,
              }}
              className={`${
                error ? 'text-red-400' : 'text-gray-400'
              } pointer-events-none absolute inset-y-0 ${
                iconPosition === 'trailing' ? 'right-0' : 'left-0'
              } flex items-center ${
                iconPosition === 'trailing' ? 'pr-3' : 'pl-3'
              }`}
            >
              <Icon
                style={{
                  width: 15,
                  height: 15,
                  fontWeight: 400,
                }}
              />
            </div>
          )}

          <input
            type={type ?? 'text'}
            name={computedName}
            id={id}
            autoComplete={autoCompute.toString()}
            required={required}
            onChange={(e) => {
              if (onChange) onChange(e.target.value)
            }}
            defaultValue={defaultValue}
            disabled={disabled ?? false}
            className={`${addon ? 'rounded-none rounded-r-md' : 'rounded-md'} ${
              error ? 'border-red-500' : 'border-gray-300'
            } shadow-sm ${
              error ? 'focus:border-red-500' : 'focus:border-indigo-500'
            } ${
              error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
            } disabled:cursor-not-allowed ${
              error ? 'disabled:border-red-200' : 'disabled:border-gray-200'
            } ${error ? 'disabled:bg-red-50' : 'disabled:bg-gray-50'} ${
              error ? 'placeholder-red-400' : 'placeholder-gray-400'
            } ${
              Icon ? `${iconPosition === 'trailing' ? 'pr-10' : 'pl-10'}` : ''
            } w-full`}
            maxLength={maxChars}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  )
}

export default InputText
