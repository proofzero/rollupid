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

import React, { Fragment, useEffect, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import classNames from 'classnames'

type SelectItem = { key: string; val: string; class: string }
export type MultiSelectProps = {
  label: string
  fieldName: string
  items: SelectItem[]
  selectedItems?: SelectItem[]
}

export default function MultiSelect({
  label,
  fieldName,
  items,
  selectedItems = [],
}: MultiSelectProps) {
  const [query, setQuery] = useState('')
  // const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedValues, setSelectedValues] = useState(selectedItems)

  const filterItems =
    query === ''
      ? items
      : items.filter((item) => {
          return item.key.toLowerCase().includes(query.toLowerCase())
        })

  useEffect(() => {
    console.log({ selectedValues })
  }, [selectedValues])

  return (
    <Combobox
      as="div"
      value={selectedValues}
      onChange={setSelectedValues}
      name={fieldName}
      multiple
    >
      <Combobox.Label className="block text-sm font-medium text-gray-700">
        {label}
      </Combobox.Label>
      <div className="relative mt-1">
        <Combobox.Input
          className="hidden"
          onChange={(e) => {
            return
          }}
          displayValue={(items) =>
            selectedValues.map((item) => item.key).join(',')
          }
        />
        <div className="w-full min-h-24 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
          {selectedValues.length ? (
            selectedValues.map((item, key) => (
              <>
                <span key={key}>
                  <span
                    contentEditable={false}
                    className={
                      'bg-indigo-50 text-indigo-600 p-1 m-1 rounded-md border'
                    }
                  >
                    {item.key}
                  </span>
                  {/* <div
                  id="tooltip-default"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  Tooltip content
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div> */}
                </span>
              </>
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

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <>
            <input
              className="w-full min-h-24 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="filter scopes"
              // displayValue={(items) =>
              //   selectedValues.map((item) => item.key).join(',')
              // }
            />
            {filterItems.map((item) => (
              <Combobox.Option
                key={item.val}
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
                        {item.key}
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
