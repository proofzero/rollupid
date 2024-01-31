import React from 'react'
import { Dropdown, DropdownSelectListItem } from './DropdownSelectList'

import {
  OAuthAccountType,
  EmailAccountType,
  CryptoAccountType,
} from '@proofzero/types/account'

import { adjustAccountTypeToDisplay } from '@proofzero/utils/getNormalisedConnectedAccounts'
export default {
    title: 'Atoms/Dropdown/ConnectedAccounts',
    component: Dropdown,
}

const pickRandomAccountType = (i: number) => {
  const types = [
    OAuthAccountType.Google,
    OAuthAccountType.Microsoft,
    EmailAccountType.Email,
    CryptoAccountType.ETH,
  ]

  return types[i % types.length]
}

const accounts: DropdownSelectListItem[] = Array.from(
  { length: 10 },
  (_, i) => ({
    value: `urn:proofzero:account:${i}`,
    title: `Account ${i}`,
    subtitle: `${adjustAccountTypeToDisplay(
      pickRandomAccountType(i)
    )} - Account ${i}`,
  })
)

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            items={accounts}
            onSelect={(val) => { console.log({ val }) }}
            placeholder='No connected account(s)'
            ConnectButtonPhrase="Connect New Account"
            ConnectButtonCallback={() => { console.log('Connect New Account') }}
            multiple={true}
            selectAllCheckboxTitle='All Connected Accounts'
            selectAllCheckboxDescription='All current and future accounts'
        />
    </div>
)

export const ConnectedAccountsSelectExample = Template.bind({}) as any
