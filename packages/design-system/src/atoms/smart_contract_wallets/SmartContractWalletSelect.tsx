import React, { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from '@heroicons/react/20/solid'
import { AddressURN } from '@proofzero/urns/address'
import { TbCirclePlus } from 'react-icons/tb'
import { HiCheck } from 'react-icons/hi'

type SmartContractWalletListItem = {
  addressURN: AddressURN
  title: string
  provider: string
  address: string
}

type SmartContractWalletSelectProps = {
  wallets?: Array<SmartContractWalletListItem>
  onSelect?: (selected: SmartContractWalletListItem) => void
}

const newSCWalletTitle = 'New Smart Contract Wallet'

export const SmartContractWalletSelect = ({
  wallets,
  onSelect,
}: SmartContractWalletSelectProps) => {
  const [selectedWallet, setSelectedWallet] =
    useState<SmartContractWalletListItem>()

  if (!wallets) wallets = []

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedWallet)
    }
  }, [selectedWallet])

  return (
    <Listbox
      value={selectedWallet}
      onChange={setSelectedWallet}
      by="addressURN"
    >
      {({ open }) => (
        <div className="relative select-none">
          <Listbox.Button className="border shadow-sm rounded-lg w-full transition-transform flex flex-row justify-between items-center py-2 px-3 hover:ring-1 hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
            {(!selectedWallet || selectedWallet.title.length === 0) && (
              <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                Select a Smart Contract Wallet
              </Text>
            )}

            {selectedWallet?.title?.length && (
              <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                {selectedWallet.title}
              </Text>
            )}

            {open ? (
              <ChevronUpIcon className="w-5 h-5 shrink-0" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 shrink-0" />
            )}
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="border shadow-lg rounded-lg absolute w-full mt-1 bg-white
            px-1 py-2 space-y-1 z-10"
            >
              {wallets?.map((wallet) => (
                <Listbox.Option
                  key={wallet.addressURN}
                  value={wallet}
                  className="flex flex-row space-x-2 cursor-pointer hover:bg-gray-100
                  rounded-lg"
                >
                  {({ selected }) => (
                    <div
                      className={`${
                        selected ? 'bg-gray-100' : ''
                      } w-full h-full rounded-lg py-2 px-2 flex flex-row`}
                    >
                      <Text
                        size="sm"
                        weight={selected ? 'medium' : 'normal'}
                        className={`truncate flex flex-row w-full`}
                      >
                        {wallet.title}
                      </Text>
                      {selected ? (
                        <span className="flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              ))}
              <Listbox.Option
                value={{
                  title: 'New Smart Contract Wallet',
                }}
                className="cursor-pointer cursor-pointer
                  hover:bg-gray-100 rounded-lg w-full bg-white"
              >
                {({ selected }) => {
                  return (
                    <div
                      className={`${
                        selected && selectedWallet?.title === newSCWalletTitle
                          ? 'bg-gray-100'
                          : ''
                      } w-full flex flex-row
                      rounded-lg py-2 px-2
                       items-center space-x-3`}
                    >
                      <TbCirclePlus className="w-4 h-4" />

                      <Text
                        size="sm"
                        weight={
                          selected && selectedWallet?.title === newSCWalletTitle
                            ? 'semibold'
                            : 'normal'
                        }
                        className={`flex-1 truncate`}
                      >
                        {newSCWalletTitle}
                      </Text>
                      {selected &&
                        selectedWallet?.title === newSCWalletTitle && (
                          <HiCheck className="w-5 h-5 text-indigo-500" />
                        )}
                    </div>
                  )
                }}
              </Listbox.Option>
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
