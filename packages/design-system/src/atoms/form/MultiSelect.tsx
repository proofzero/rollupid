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

import React, { useEffect, useRef, useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { IoCloseOutline } from 'react-icons/io5'
import { Combobox } from '@headlessui/react'
import classNames from 'classnames'
import { Text } from '../text/Text'
import { Pill } from '../pills/Pill'
import { ExperimentalFeaturePill } from '../pills/ExperimentalFeaturePill'

type SelectItem = {
  id: string
  val: string
  desc?: string
  disabled?: boolean
  section?: string
  experimental?: boolean
}
export type MultiSelectProps = {
  label: string
  fieldName: string
  items: SelectItem[]
  width: number
  preselectedItems?: SelectItem[]
  disabled?: boolean
  onChange?: () => void
  learnMore?: string
}

const ComboboxItem = ({ item, selected }) => {
  return (
    <div
      className={`flex flex-row items-start justify-start rounded-lg p-2 ${
        selected ? 'bg-gray-100 w-full' : ''
      }`}
    >
      <input
        type="checkbox"
        className={`rounded mr-2 mt-1 text-indigo-500
                            border-gray-300 ${
                              item.disabled ? 'bg-gray-300' : ''
                            }`}
        checked={selected}
      ></input>
      <div>
        <div className="flex flex-row flex-wrap space-x-2">
          <Text
            size="sm"
            weight="medium"
            className="truncate inline text-gray-900"
          >
            {item.val}
          </Text>
          <Text
            size="sm"
            weight="medium"
            className="truncate inline text-gray-900"
          >
            -
          </Text>
          <Text
            size="sm"
            weight="medium"
            className="font-ibm-plex-mono inline ml-2 truncate text-gray-500"
          >
            {item.id}
          </Text>
          {item.disabled && (
            <Pill className="bg-gray-100 text-gray-500 rounded-xl ml-2">
              Enable in &quot;{item.section}&quot; section
            </Pill>
          )}
          {!item.disabled && item.experimental && (
            <ExperimentalFeaturePill
              className={`${selected ? 'bg-gray-200' : 'bg-gray-100'}`}
              text="Experimental Feature"
            />
          )}
        </div>
        <Text size="xs" className="mt-1 text-gray-500">
          {item.desc}
        </Text>
      </div>
    </div>
  )
}

const computeItemsToDisplay = (selectedItems, width) => {
  let artificialWidth = 40
  let itemsLeft = 0
  const items = []
  selectedItems
    .sort((a, b) => a.val.length - b.val.length)
    .forEach((item) => {
      if (
        // additional item + items left to display
        artificialWidth + item.val.length * 10.5 + 10 + 42 <
        width
      ) {
        artificialWidth += item.val.length * 10.5 + 42
        items.push(item)
      } else {
        itemsLeft += 1
      }
    })

  if (itemsLeft > 0) {
    items.push({
      id: 'items_left',
      val: `${itemsLeft}`,
      desc: '',
    })
  }
  return items
}

export function MultiSelect({
  label,
  fieldName,
  items,
  disabled = false,
  preselectedItems = [],
  onChange,
  width,
  learnMore,
}: MultiSelectProps) {
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const [selectedItems, setSelectedItems] = useState(preselectedItems)
  const [itemsToDisplay, setItemsToDisplay] = useState(() => {
    return computeItemsToDisplay(preselectedItems, width)
  })

  useEffect(() => {
    const items = computeItemsToDisplay(selectedItems, width)
    setItemsToDisplay(items)
  }, [selectedItems, width])

  const filterItems =
    query === ''
      ? items
      : items.filter((item) => {
          return (
            item.val.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase())
          )
        })

  const [selectedFilteredItems, notSelectedFilteredItems] = filterItems.reduce(
    ([selected, notSelected], item) => {
      selectedItems.find((val) => val.id === item.id)
        ? selected.push(item)
        : notSelected.push(item)
      return [selected, notSelected]
    },
    [[], []]
  )

  return (
    <Combobox
      as="div"
      by="id" // compare values
      value={selectedItems}
      disabled={disabled}
      onChange={(e) => {
        setSelectedItems(e)
        !!onChange && onChange()
      }}
      name={fieldName}
      multiple
    >
      {({ open }) => (
        <>
          <div className="flex flex-row justify-between">
            <Combobox.Label className="block text-sm font-medium text-gray-700">
              {label}
            </Combobox.Label>
            <a
              className="block text-sm font-medium text-indigo-500"
              target="_blank"
              rel="noreferrer"
              href={learnMore ? learnMore : 'https://docs.rollup.id'}
            >
              Learn More
            </a>
          </div>
          <div className={`relative mt-1`}>
            <Combobox.Button
              ref={ref}
              className={`${
                disabled ? 'cursor-no-drop bg-gray-100' : 'bg-white'
              } w-full block min-h-24 rounded shadow-sm border border-gray-300 ${
                selectedItems.length ? '' : 'py-2'
              } pl-3 pr-7
        shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm
        flex flex-row items-center justify-start`}
              onClick={() => {
                setQuery('')
              }}
            >
              {selectedItems.length > 0 ? (
                itemsToDisplay.map((item, key) => {
                  return (
                    <div key={key}>
                      {item.id === 'items_left' ? (
                        <div className="flex flex-row items-center">
                          {+item.val > 1 ? (
                            <div
                              className="bg-indigo-50 text-gray-800 px-2
                            py-[3px] m-1 rounded-md border border-indigo-300
                            z-998 flex flex-row 
                            items-center justify-start gap-x-1"
                            >
                              +
                            </div>
                          ) : null}
                          <div
                            className={`bg-indigo-50 text-gray-800 px-2 py-[3px] 
                          ${
                            +item.val > 1 ? '-m-6' : 'm-1'
                          } rounded-md border border-indigo-300
                          z-998 flex flex-row items-center
                          justify-start gap-x-1`}
                          >
                            +{item.val}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="bg-indigo-50 text-gray-800 px-1
                              py-[3px] m-1 rounded-md border 
                              z-998 flex flex-row items-center
                              justify-start gap-x-1 border-indigo-300"
                          onClick={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                          }}
                        >
                          {item.val}

                          <IoCloseOutline
                            className="h-5 w-5 text-gray-800 cursor-pointer z-999"
                            onClick={() => {
                              setSelectedItems(
                                selectedItems.filter((v) => v.id !== item.id)
                              )
                              if (onChange) onChange()
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="opacity-0">no select</div>
              )}

              <div className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </Combobox.Button>

            <Combobox.Options
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto thin-scrollbar rounded-md bg-white py-1
         text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              <div>
                <div className="flex flex-row items-center min-w-full">
                  <Combobox.Input
                    className={`${
                      disabled ? 'cursor-no-drop bg-gray-100' : 'bg-white'
                    } truncate w-full pl-3 py-2 rounded-md border-none sm:text-sm focus-none focus:ring-0`}
                    onChange={(event) => {
                      setQuery(event.target.value)
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                    }}
                    onKeyUp={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                    }}
                    value={query}
                    placeholder={'filter scopes'}
                  />
                  {query.length ? (
                    <div className={`ml-auto rounded-r-md px-3`}>
                      <IoCloseOutline
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => setQuery('')}
                      />
                    </div>
                  ) : null}
                </div>
                {filterItems ? (
                  <>
                    {selectedFilteredItems.length
                      ? selectedFilteredItems.map((item) => (
                          <Combobox.Option
                            key={item.id}
                            value={item}
                            className={({ active }) =>
                              classNames(
                                'relative cursor-default select-none m-2',
                                active ? 'bg-gray-50' : ''
                              )
                            }
                            disabled={item.disabled}
                          >
                            {({ selected }) => (
                              <ComboboxItem item={item} selected={selected} />
                            )}
                          </Combobox.Option>
                        ))
                      : null}

                    {notSelectedFilteredItems.length
                      ? notSelectedFilteredItems.map((item) => (
                          <Combobox.Option
                            key={item.id}
                            value={item}
                            className={({ active }) =>
                              classNames(
                                'relative cursor-default select-none m-2',
                                active ? 'bg-gray-50' : ''
                              )
                            }
                            disabled={item.disabled}
                          >
                            {({ selected }) => (
                              <ComboboxItem item={item} selected={selected} />
                            )}
                          </Combobox.Option>
                        ))
                      : null}
                  </>
                ) : (
                  <div className="p-2 px-5 ">No items found</div>
                )}
              </div>
            </Combobox.Options>
          </div>
        </>
      )}
    </Combobox>
  )
}
