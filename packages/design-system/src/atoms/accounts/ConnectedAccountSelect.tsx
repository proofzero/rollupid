import React, { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'
import { AddressURN } from '@proofzero/urns/address'
import { ConnectNewAccountButton } from './ConnectNewButton'

type ConnectedAccountSelectListItem = {
  addressURN: AddressURN
  title: string
  provider: string
  address: string
}

type ConnectedAccountSelectProps = {
  accounts: Array<ConnectedAccountSelectListItem>
  onConnectNew: () => void
  onSelect?: (selected: Array<ConnectedAccountSelectListItem>) => void
  onSelectAll?: () => void
}

export const ConnectedAccountSelect = ({
  accounts,
  onConnectNew,
  onSelect,
  onSelectAll,
}: ConnectedAccountSelectProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<
    Array<ConnectedAccountSelectListItem>
  >([])

  const [allConnectedAccountsSelected, setAllConnectedAccountsSelected] =
    useState(false)

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  useEffect(() => {
    if (allConnectedAccountsSelected) {
      setSelectedAccounts([])

      if (onSelectAll) {
        onSelectAll()
      }
    } else {
      if (onSelect) {
        onSelect(selectedAccounts)
      }
    }
  }, [selectedAccounts, allConnectedAccountsSelected])

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
            {(!selectedAccounts || selectedAccounts.length === 0) &&
              !allConnectedAccountsSelected && (
                <Text
                  size="sm"
                  className="text-gray-800 truncate text-ellipsis"
                >
                  No connected account(s)
                </Text>
              )}

            {selectedAccounts?.length === 1 && !allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                {selectedAccounts[0].title}
              </Text>
            )}
            {selectedAccounts?.length > 1 && !allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                {selectedAccounts.length} accounts selected
              </Text>
            )}

            {allConnectedAccountsSelected && (
              <Text size="sm" className="text-gray-800 truncate text-ellipsis">
                All connected accounts
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
            <Listbox.Options className="border shadow-lg rounded-lg absolute w-full mt-1 bg-white space-y-3 z-10">
              <div
                className="flex flex-row space-x-2 cursor-pointer items-center px-4 pt-3"
                onClick={() =>
                  setAllConnectedAccountsSelected(!allConnectedAccountsSelected)
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
                <div className="flex-1 truncate">
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-900 truncate text-ellipsis"
                  >
                    All connected accounts
                  </Text>
                </div>
              </div>

              <div className="mx-4 w-100 border-b border-gray-200"></div>

              <div className="px-4 pb-3 space-y-3 max-h-[140px] overflow-y-scroll no-scrollbar">
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
                    <div className="flex-1 flex flex-col truncate">
                      <Text
                        size="sm"
                        weight="medium"
                        className={`truncate text-ellipsis ${
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
                        className={`truncate text-ellipsis ${
                          allConnectedAccountsSelected
                            ? 'text-gray-400'
                            : 'text-gray-500'
                        }`}
                      >
                        {capitalizeFirstLetter(account.provider)} -{' '}
                        {account.address}
                      </Text>
                    </div>
                  </Listbox.Option>
                ))}
              </div>

              <div className="mx-4 w-100 border-b border-gray-200"></div>

              <div className="px-4 pb-3">
                <ConnectNewAccountButton
                  phrase="Connect New Account"
                  onConnectNew={onConnectNew}
                />
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  )
}
