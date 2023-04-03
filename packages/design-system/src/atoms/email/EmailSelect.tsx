import React from 'react'
import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiCheck } from 'react-icons/hi'
import { TbCircleOff, TbCirclePlus } from 'react-icons/tb'
import { MdOutlineAlternateEmail } from 'react-icons/md'

import { OAuthAddressType } from '@proofzero/types/address'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

import type { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedEmails'
import type { AddressURN } from '@proofzero/urns/address'

type EmailSelectProps = {
  items: EmailSelectListItem[]
  enableAddNew?: boolean
  enableNone?: boolean
  onSelect?: (emailAddressURN: AddressURN) => void
}

enum OptionType {
  Email,
  AddNew,
  None,
}

export const EmailSelect = ({
  items,
  enableAddNew = false,
  enableNone = false,
  onSelect,
}: EmailSelectProps) => {
  const options = items.map((item) => ({
    ...item,
    type: OptionType.Email,
  }))

  const [selected, setSelected] = useState(
    options[0] || {
      type: OptionType.None,
      email: 'None',
    }
  )

  return (
    <Listbox
      value={selected}
      onChange={(selected) => {
        onSelect && 'addressURN' in selected && onSelect(selected.addressURN)
        setSelected(selected)
      }}
      by="email"
    >
      {({ open }) => (
        <div className="relative bg-white">
          <Listbox.Button
            className="border shadow-sm rounded-lg w-full transition-transform
            flex flex-row space-between items-center py-2 px-3 hover:ring-1
            hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <Text size="sm" className="bg-white flex-1 text-left text-gray-800">
              {selected.email}
            </Text>
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
             absolute w-full mt-1 bg-white"
            >
              {items.map((item, i) => {
                const iconURL =
                  item.type === OAuthAddressType.Microsoft
                    ? microsoftIcon
                    : item.type === OAuthAddressType.Google
                    ? googleIcon
                    : null

                return (
                  <Listbox.Option
                    key={i}
                    value={item}
                    className="py-2 px-3 cursor-pointer
                  hover:bg-gray-50"
                  >
                    {({ selected }) => (
                      <div className="flex flex-row items-center">
                        {iconURL ? (
                          <img src={iconURL} className="w-4 h-4 mr-3" />
                        ) : (
                          <MdOutlineAlternateEmail className="w-4 h-4 mr-3" />
                        )}

                        <Text
                          size="sm"
                          weight={selected ? 'semibold' : 'normal'}
                          className={`${selected ? '' : ''} flex-1`}
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
