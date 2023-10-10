import { Switch } from '@headlessui/react'
import React, { useState } from 'react'
import { Text } from '../text/Text'

export type InputToggleProps = {
  id: string
  label?: string
  name?: string
  onToggle?: (val: boolean) => void
  checked?: boolean
  className?: string
  disabled?: boolean
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const InputToggle = ({
  id,
  name,
  label,
  checked,
  disabled = false,
  onToggle,
}: InputToggleProps) => {
  const [enabled, setEnabled] = useState(checked)
  const computedName = name ?? id

  return (
    <div
      className={`flex flex-row items-center ${
        label && label !== '' ? 'space-x-8' : ''
      }`}
    >
      {label && (
        <Text size="sm" weight="medium" className="text-gray-800">
          {label}
        </Text>
      )}

      <input
        id={id}
        name={computedName}
        disabled={disabled}
        type="hidden"
        defaultChecked={enabled}
        defaultValue={enabled ? 1 : 0}
      />

      <Switch
        checked={enabled}
        disabled={disabled}
        onChange={(state) => {
          setEnabled(state)
          onToggle(state)
        }}
        className={classNames(
          enabled ? 'bg-green-500' : 'bg-gray-200',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
    </div>
  )
}
