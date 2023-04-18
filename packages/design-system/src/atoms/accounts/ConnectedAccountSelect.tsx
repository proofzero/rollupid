import React, { useState } from 'react'
import { Listbox } from '@headlessui/react'
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
  const [selectedAccounts, setSelectedAccounts] =
    useState<Array<ConnectedAccountSelectListItem>>()

  return (
    <Listbox
      value={selectedAccounts}
      onChange={setSelectedAccounts}
      multiple
      by="accountURN"
    >
      {({ open }) => (
        <>
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

          <Listbox.Options>
            {accounts.map((account) => (
              <Listbox.Option key={account.accountURN} value={account}>
                {account.title}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  )
}
