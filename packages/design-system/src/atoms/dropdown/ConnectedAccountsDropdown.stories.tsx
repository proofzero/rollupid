import React from 'react'
import { Dropdown, SelectListItem } from './Dropdown'

import { OAuthAddressType, EmailAddressType, CryptoAddressType } from '@proofzero/types/address'

export default {
    title: 'Atoms/Dropdown/ConnectedAccounts',
    component: Dropdown,
}

const pickRandomType = (i: number) => {
    const types = [OAuthAddressType.Google,
    OAuthAddressType.Microsoft,
    EmailAddressType.Email,
    CryptoAddressType.ETH]

    return types[i % types.length]
}

const accounts: SelectListItem[] = Array.from({ length: 10 }, (_, i) => ({
    identifier: `urn:proofzero:address:${i}`,
    title: `Account ${i}`,
    type: pickRandomType(i),
    address: `Address ${i}`,
}))

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            values={accounts}
            onSelect={(val) => { console.log({ val }) }}
            placeholder='No connected account(s)'
            ConnectButtonPhrase="Connect New Account"
            ConnectButtonCallback={() => { console.log('Connect New Account') }}
            multiple={true}
            allSelectedValuesTitle='All Connected Accounts'
            identifierAllValues='All current and future accounts'
        />
    </div>
)

export const ConnectedAccountsSelectExample = Template.bind({}) as any