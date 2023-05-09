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
import { Text } from '../text/Text'

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
              placeholder="filter scopes"
            />
            {filterItems.map((item) => (
              <Combobox.Option
                key={item.id}
                value={item}
                // as={Fragment}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none m-2',
                    active ? 'bg-gray-50' : ''
                  )
                }
              >
                {({ selected }) => (
                  <div
                    className={`flex flex-row items-start justify-start rounded-lg p-2 ${
                      selected ? 'bg-gray-100 w-full' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="rounded mr-2 mt-1 text-indigo-500"
                      checked={selected}
                    ></input>
                    <div>
                      <Text
                        size="sm"
                        weight="medium"
                        className="font-ibm-plex-mono truncate inline text-gray-900"
                      >
                        {item.val} -
                      </Text>
                      <Text
                        size="sm"
                        weight="medium"
                        className="font-ibm-plex-mono inline ml-2 truncate text-gray-500"
                      >
                        {item.id}
                      </Text>
                      <Text size="xs" className="mt-1 text-gray-500">
                        {item.desc}
                      </Text>
                    </div>
                  </div>
                )}
              </Combobox.Option>
            ))}
          </>
        </Combobox.Options>
      </div>
    </Combobox>
  )
}
