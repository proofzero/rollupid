import React, { useState } from 'react'
import { Listbox } from '@headlessui/react'
import { AccountURN } from '@proofzero/urns/account'

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
  >([accounts[0], accounts[1]])

  return (
    <Listbox
      value={selectedAccounts}
      onChange={setSelectedAccounts}
      multiple
      by="accountURN"
    >
      <Listbox.Button>
        {selectedAccounts.map((account) => account.title).join(', ')}
      </Listbox.Button>
      <Listbox.Options>
        {accounts.map((account) => (
          <Listbox.Option key={account.accountURN} value={account}>
            {account.title}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  )
}
