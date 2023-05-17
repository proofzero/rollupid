import React, { useEffect } from 'react'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiCheck } from 'react-icons/hi'
import { TbCircleOff, TbCirclePlus } from 'react-icons/tb'
import { HiOutlineEnvelope } from 'react-icons/hi2'

import { EmailAddressType, OAuthAddressType } from '@proofzero/types/address'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import appleIcon from '@proofzero/design-system/src/assets/social_icons/apple.svg'

import { OptionType } from '@proofzero/utils/getNormalisedConnectedAccounts'

import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedAccounts'
import type { AddressURN } from '@proofzero/urns/address'

type EmailSelectProps = {
  items: EmailSelectListItem[]
  defaultAddress?: AddressURN
  enableAddNew?: boolean
  enableNone?: boolean
  onSelect?: (selected: EmailSelectListItem) => void
}

const getIconUrl = (
  type?: OAuthAddressType | EmailAddressType | OptionType
) => {
  return type
    ? type === OAuthAddressType.Microsoft
      ? microsoftIcon
      : type === OAuthAddressType.Apple
      ? appleIcon
      : type === OAuthAddressType.Google
      ? googleIcon
      : null
    : null
}

export const EmailSelect = ({
  items,
  defaultAddress,
  enableAddNew = false,
  enableNone = false,
  onSelect,
}: EmailSelectProps) => {
  const [selected, setSelected] = useState(() => {
    if (defaultAddress) {
      const defaultItem = items.find(
        (item) => item.addressURN === defaultAddress
      )

      return defaultItem
    }
  })

  useEffect(() => {
    if (selected && onSelect) {
      onSelect(selected)
    }
  }, [selected])

  const selectedIconURL = getIconUrl(selected?.type)

  return (
    <Listbox
      value={selected}
      onChange={(selected) => {
        setSelected(selected)
      }}
      by="addressURN"
    >
      {({ open }) => (
        <div className="relative rounded-lg w-full bg-white dark:bg-gray-800">
          <Listbox.Button
            className={`border dark:border-gray-600 shadow-sm rounded-lg w-full transition-transform
            flex flex-row space-between items-center py-2 px-3 ${
              items.length === 0
                ? ''
                : 'hover:ring-1\
            hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500'
            } bg-white dark:bg-gray-800`}
          >
            {!selected && (
              <Text
                size="sm"
                className="bg-white dark:bg-gray-800 flex-1 text-left text-gray-400 dark:text-white truncate text-ellipsis"
              >
                {enableAddNew ? 'Connect new email address' : 'None'}
              </Text>
            )}
            {selected && (
              <Text
                size="sm"
                className="bg-white dark:bg-gray-800 flex-1 text-left text-gray-800 dark:text-white truncate text-ellipsis"
              >
                {selected?.email}
              </Text>
            )}
            {open ? (
              <ChevronDownIcon className="w-5 h-5 rotate-180 dark:text-white" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 dark:text-white" />
            )}
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="border dark:border-gray-600 shadow-lg rounded-lg
             absolute w-full mt-1 bg-white dark:bg-gray-800 z-10"
            >
              {items.map((item, i) => {
                const iconURL = getIconUrl(item.type)
                return (
                  <Listbox.Option
                    key={i}
                    value={item}
                    className="py-2 px-3 cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {({ selected }) => (
                      <div className="flex flex-row items-center truncate">
                        {iconURL ? (
                          <img src={iconURL} className="w-4 h-4 mr-3" />
                        ) : (
                          <HiOutlineEnvelope className="w-4 h-4 mr-3" />
                        )}

                        <Text
                          size="sm"
                          weight={selected ? 'semibold' : 'normal'}
                          className={`truncate text-ellipsis ${
                            selected ? '' : ''
                          } flex-1 dark:text-white`}
                        >
                          {item.email}
                        </Text>
                        {selected && (
                          <HiCheck className="w-5 h-5 text-indigo-500" />
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                )
              })}

              {enableNone && (
                <Listbox.Option
                  value={{
                    type: OptionType.None,
                    email: 'None',
                  }}
                  className="py-2 px-3 cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {({ selected }) => (
                    <div className="flex flex-row items-center space-x-3">
                      <TbCircleOff className="w-4 h-4" />

                      <Text
                        size="sm"
                        weight={selected ? 'semibold' : 'normal'}
                        className={`${
                          selected ? '' : ''
                        } flex-1 truncate dark:text-white`}
                      >
                        None
                      </Text>
                      {selected && (
                        <HiCheck className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              )}

              {enableAddNew && (
                <Listbox.Option
                  value={{
                    type: OptionType.AddNew,
                    email: 'Connect new email address',
                  }}
                  className="py-2 px-3 cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {({ selected }) => (
                    <div className="flex flex-row items-center space-x-3">
                      <TbCirclePlus className="w-4 h-4" />

                      <Text
                        size="sm"
                        weight={selected ? 'semibold' : 'normal'}
                        className={`${
                          selected ? '' : ''
                        } flex-1 truncate dark:text-white`}
                      >
                        Connect new email address
                      </Text>
                      {selected && (
                        <HiCheck className="w-5 h-5 text-indigo-500" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
