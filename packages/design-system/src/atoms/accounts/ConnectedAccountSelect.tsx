import React, { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { AccountURN } from '@proofzero/urns/account'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

type ConnectedAccountSelectListItem = {
  accountURN: AccountURN
  title: string
  provider: string
  address: string
}

type ConnectedAccountSelectProps = {
  accounts: Array<ConnectedAccountSelectListItem>
}

export const ConnectedAccountSelect = ({
  accounts,
}: ConnectedAccountSelectProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<
    Array<ConnectedAccountSelectListItem>
  >([])

  return (
    <Listbox
      value={selectedAccounts}
      onChange={setSelectedAccounts}
      multiple
      by="accountURN"
    >
      {({ open }) => (
        <div className="relative">
          <Listbox.Button className="border shadow-sm rounded-lg w-full transition-transform flex flex-row justify-between items-center py-2 px-3 hover:ring-1 hover:ring-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
            {(!selectedAccounts || selectedAccounts.length === 0) && (
              <Text size="sm" className="text-gray-800">
                No connected account(s)
              </Text>
            )}

            {selectedAccounts?.length === 1 && (
              <Text size="sm" className="text-gray-800">
                {selectedAccounts[0].address}
              </Text>
            )}
            {selectedAccounts?.length > 1 && (
              <Text size="sm" className="text-gray-800">
                {selectedAccounts.length} accounts selected
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
              {accounts?.map((account) => (
                <Listbox.Option
                  key={account.accountURN}
                  value={account}
                  className="flex flex-row space-x-2 cursor-pointer"
                >
                  <div>
                    <input
                      readOnly
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-indigo-500 focus:ring-indigo-500"
                      checked={selectedAccounts?.includes(account)}
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <Text size="sm" weight="medium" className="text-gray-900">
                      {account.title}
                    </Text>
                    <Text size="xs" weight="normal" className="text-gray-500">
                      {account.provider} - {account.address}
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
