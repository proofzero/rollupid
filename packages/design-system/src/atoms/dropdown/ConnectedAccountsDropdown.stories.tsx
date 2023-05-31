import React from 'react'
import { Dropdown, DropdownSelectListItem } from './DropdownSelectList'

import { OAuthAddressType, EmailAddressType, CryptoAddressType } from '@proofzero/types/address'

import { adjustAddressTypeToDisplay } from '@proofzero/utils/getNormalisedConnectedAccounts'
export default {
    title: 'Atoms/Dropdown/ConnectedAccounts',
    component: Dropdown,
}

const pickRandomAddressType = (i: number) => {
    const types = [OAuthAddressType.Google,
    OAuthAddressType.Microsoft,
    EmailAddressType.Email,
    CryptoAddressType.ETH]

    return types[i % types.length]
}

const accounts: DropdownSelectListItem[] = Array.from({ length: 10 }, (_, i) => ({
    value: `urn:proofzero:address:${i}`,
    title: `Account ${i}`,
    subtitle: `${adjustAddressTypeToDisplay(pickRandomAddressType(i))} - Address ${i}`
}))

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