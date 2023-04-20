import React, { useEffect } from 'react'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiCheck } from 'react-icons/hi'
import { TbCircleOff, TbCirclePlus } from 'react-icons/tb'
import { MdOutlineAlternateEmail } from 'react-icons/md'

import { EmailAddressType, OAuthAddressType } from '@proofzero/types/address'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import appleIcon from '@proofzero/design-system/src/assets/social_icons/apple.svg'

import { OptionType } from '@proofzero/utils/getNormalisedConnectedEmails'

import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'

type EmailSelectProps = {
  items: EmailSelectListItem[]
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
  enableAddNew = false,
  enableNone = false,
  onSelect,
}: EmailSelectProps) => {
  const [selected, setSelected] = useState(items[0])

  useEffect(() => {
    if (onSelect) {
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
      by="email"
    >
      {({ open }) => (
        <div className="relative bg-white">
          <Listbox.Button
            className={`border shadow-sm rounded-lg w-full transition-transform
            flex flex-row space-between items-center py-2 px-3 ${
              items.length === 0
                ? ''
                : 'hover:ring-1\
            hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500'
            } bg-white`}
          >
            {selectedIconURL ? (
              <img src={selectedIconURL} className="w-4 h-4 mr-3" />
            ) : (
              <MdOutlineAlternateEmail className="w-4 h-4 mr-3" />
            )}

            {!selected && (
              <Text
                size="sm"
                className="bg-white flex-1 text-left text-gray-400 truncate text-ellipsis"
              >
                {enableAddNew ? 'Connect new email address' : 'None'}
              </Text>
            )}
            {selected && (
              <Text
                size="sm"
                className="bg-white flex-1 text-left text-gray-800 truncate text-ellipsis"
              >
                {selected?.email}
              </Text>
            )}
            {open ? (
              <ChevronDownIcon className="w-5 h-5 rotate-180" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="border shadow-lg rounded-lg
             absolute w-full mt-1 bg-white z-10"
            >
              {items.map((item, i) => {
                const iconURL = getIconUrl(item.type)
                return (
                  <Listbox.Option
                    key={i}
                    value={item}
                    className="py-2 px-3 cursor-pointer
                  hover:bg-gray-50"
                  >
                    {({ selected }) => (
                      <div className="flex flex-row items-center truncate">
                        {iconURL ? (
                          <img src={iconURL} className="w-4 h-4 mr-3" />
                        ) : (
                          <MdOutlineAlternateEmail className="w-4 h-4 mr-3" />
                        )}

                        <Text
                          size="sm"
                          weight={selected ? 'semibold' : 'normal'}
                          className={`truncate text-ellipsis ${selected ? '' : ''} flex-1`}
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
                  hover:bg-gray-50"
                >
                  {({ selected }) => (
                    <div className="flex flex-row items-center space-x-3">
                      <TbCircleOff className="w-4 h-4" />

                      <Text
                        size="sm"
                        weight={selected ? 'semibold' : 'normal'}
                        className={`${selected ? '' : ''} flex-1 truncate`}
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
                  hover:bg-gray-50"
                >
                  {({ selected }) => (
                    <div className="flex flex-row items-center space-x-3">
                      <TbCirclePlus className="w-4 h-4" />

                      <Text
                        size="sm"
                        weight={selected ? 'semibold' : 'normal'}
                        className={`${selected ? '' : ''} flex-1 truncate`}
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
