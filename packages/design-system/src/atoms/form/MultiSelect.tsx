/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/

//https://headlessui.com/react/combobox

import React, { useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import classNames from 'classnames'

type SelectItem = { id: string; val: string; desc: string }
export type MultiSelectProps = {
  label: string
  fieldName: string
  items: SelectItem[]
  selectedItems?: SelectItem[]
  disabled?: boolean
  onChange?: () => void
}

export function MultiSelect({
  label,
  fieldName,
  items,
  disabled = false,
  selectedItems = [],
  onChange,
}: MultiSelectProps) {
  const [query, setQuery] = useState('')
  const [selectedValues, setSelectedValues] = useState(selectedItems)

  const filterItems =
    query === ''
      ? items
      : items.filter((item) => {
          return (
            item.val.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase())
          )
        })

  return (
    <Combobox
      as="div"
      by="id" // compare values
      value={selectedValues}
      disabled={disabled}
      onChange={(e) => {
        setSelectedValues(e)
        !!onChange && onChange()
      }}
      name={fieldName}
      multiple
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </Combobox.Label>
      <div className={`relative mt-1`}>
        <div
          className={`${
            disabled ? 'cursor-no-drop bg-gray-100' : 'bg-white'
          } w-full min-h-24 rounded-md border border-gray-300 py-2 pl-3 pr-10 
        shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm
          `}
        >
          {selectedValues.length ? (
            selectedValues.map((item, key) => (
              <span key={key}>
                <span
                  className={
                    'bg-indigo-50 text-indigo-600 p-1 m-1 rounded-md border'
                  }
                >
                  {item.val}
                </span>
              </span>
            ))
          ) : (
            <span className="opacity-0">no select</span>
          )}
        </div>
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        <Combobox.Options
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1
         text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <>
            <Combobox.Input
              className={`${
                disabled ? 'cursor-no-drop bg-gray-100' : 'bg-white'
              } w-full min-h-24 rounded-md border border-gray-300 
              py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none
               focus:ring-1 focus:ring-indigo-500 sm:text-sm`}
              onChange={(event) => setQuery(event.target.value)}
              // displayValue={(items) =>
              //   selectedValues.map((item) => item.class).join(',')
              // }
              placeholder="filter scopes"
            />
            {filterItems.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                // as={Fragment}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex">
                      <span
                        className={classNames(
                          'truncate',
                          selected && 'font-semibold'
                        )}
                      >
                        {item.id}
                      </span>
                      <span
                        className={classNames(
                          'ml-2 truncate text-gray-500',
                          active ? 'text-indigo-200' : 'text-gray-500'
                        )}
                      >
                        {item.val}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 right-0 flex items-center pr-4',
                          active ? 'text-white' : 'text-indigo-600'
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </>
        </Combobox.Options>
      </div>
    </Combobox>
  )
}
