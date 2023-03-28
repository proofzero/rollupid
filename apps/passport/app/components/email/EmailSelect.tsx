import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiCheck } from 'react-icons/hi'
import { TbCircleMinus, TbCirclePlus } from 'react-icons/tb'

type EmailSelectListItem = {
  iconURL: string
  email: string
}

type EmailSelectProps = {
  items: EmailSelectListItem[]
  enableAddNew?: boolean
  allowEmpty?: boolean
}

export const EmailSelect = ({
  items,
  enableAddNew = false,
  allowEmpty = false,
}: EmailSelectProps) => {
  const [selected, setSelected] = useState(
    items[0]?.email ?? 'No email address available'
  )

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative">
        <Listbox.Button className="border shadow-sm rounded-lg w-full flex flex-row space-between items-center py-2 px-3 hover:ring-1 hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500">
          <Text size="sm" className="flex-1 text-left text-gray-800">
            {selected}
          </Text>
          <ChevronDownIcon className="w-5 h-5" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="border shadow-lg rounded-lg absolute w-full mt-1 bg-white">
            {items.map((item, i) => (
              <Listbox.Option
                key={i}
                value={item.email}
                className="py-2 px-3 cursor-pointer"
              >
                {({ selected }) => (
                  <div className="flex flex-row items-center">
                    <img src={item.iconURL} className="w-4 h-4 mr-3" />

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
            ))}

            {allowEmpty && (
              <Listbox.Option
                value={'None'}
                className="py-2 px-3 cursor-pointer"
              >
                {({ selected }) => (
                  <div className="flex flex-row items-center space-x-3">
                    <TbCircleMinus className="w-4 h-4" />

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
                value={'Connect new email address'}
                className="py-2 px-3 cursor-pointer"
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
    </Listbox>
  )
}
