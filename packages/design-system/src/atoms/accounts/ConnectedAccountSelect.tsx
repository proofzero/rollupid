import React, { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { AddressURN } from '@proofzero/urns/address'

type ConnectedAccountSelectListItem = {
  addressURN: AddressURN
  title: string
  provider: string
  address: string
}

type ConnectedAccountSelectProps = {
  accounts: Array<ConnectedAccountSelectListItem>
  onSelect?: (selected: Array<ConnectedAccountSelectListItem>) => void
}

export const ConnectedAccountSelect = ({
  accounts,
  onSelect,
}: ConnectedAccountSelectProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<
    Array<ConnectedAccountSelectListItem>
  >([])

  const allConnectedAccountsSelected =
    selectedAccounts.length > 0 && selectedAccounts.length === accounts.length

  const truncateAddress = (address: string) =>
    address.length > 17
      ? address.substring(0, 7) + '...' + address.substring(address.length - 7)
      : address

  useEffect(() => {
    if (onSelect) {
      onSelect(selectedAccounts)
    }
  }, [selectedAccounts])

  return (
    <Listbox
      value={selectedAccounts}
      onChange={setSelectedAccounts}
      multiple
      by="addressURN"
    >
      {({ open }) => (
        <div className="relative select-none">
          <Listbox.Button className="border shadow-sm rounded-lg w-full transition-transform flex flex-row justify-between items-center py-2 px-3 hover:ring-1 hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
            {(!selectedAccounts || selectedAccounts.length === 0) && (
              <Text size="sm" className="text-gray-800">
                No connected account(s)
              </Text>
            )}

            {selectedAccounts?.length === 1 && !allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800">
                {truncateAddress(selectedAccounts[0].address)}
              </Text>
            )}
            {selectedAccounts?.length > 1 && !allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800">
                {selectedAccounts.length} accounts selected
              </Text>
            )}

            {allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800">
                All connected accounts
              </Text>
            )}

            {open ? (
              <ChevronUpIcon className="w-5 h-5" />
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
            <Listbox.Options className="border shadow-lg rounded-lg absolute w-full mt-1 bg-white px-4 py-3 space-y-3">
              <div
                className="flex flex-row space-x-2 cursor-pointer items-center"
                onClick={() =>
                  allConnectedAccountsSelected
                    ? setSelectedAccounts([])
                    : setSelectedAccounts(accounts)
                }
              >
                <div>
                  <input
                    readOnly
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-indigo-500 focus:ring-indigo-500"
                    checked={allConnectedAccountsSelected}
                  />
                </div>
                <div className="flex-1">
                  <Text size="sm" weight="medium" className="text-gray-900">
                    All connected accounts
                  </Text>
                </div>
              </div>

              <div className="w-100 border-b border-gray-200"></div>

              {accounts?.map((account) => (
                <Listbox.Option
                  key={account.addressURN}
                  value={account}
                  className="flex flex-row space-x-2 cursor-pointer"
                  disabled={allConnectedAccountsSelected}
                >
                  <div>
                    <input
                      readOnly
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-indigo-500 focus:ring-indigo-500"
                      checked={
                        !allConnectedAccountsSelected &&
                        selectedAccounts
                          .map((sa) => sa.addressURN)
                          .includes(account.addressURN)
                      }
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <Text
                      size="sm"
                      weight="medium"
                      className={`${
                        allConnectedAccountsSelected
                          ? 'text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {account.title}
                    </Text>
                    <Text
                      size="xs"
                      weight="normal"
                      className={`${
                        allConnectedAccountsSelected
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {account.provider} - {truncateAddress(account.address)}
                    </Text>
                  </div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
