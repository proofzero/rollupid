import React from 'react'
import { Dropdown, SelectListItem } from './DropdownSelectList'

import { CryptoAddressType } from '@proofzero/types/address'

export default {
    title: 'Atoms/Dropdown/SmartContractWallets',
    component: Dropdown,
}


const accounts: SelectListItem[] = Array.from({ length: 10 }, (_, i) => ({
    label: `urn:proofzero:address:${i}`,
    title: `Smart Contract Wallet ${i}`,
    details: {
        type: CryptoAddressType.Wallet,
        address: `SC Wallet: ${i}`,
    }
}))

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            values={accounts}
            onSelect={(val) => { console.log({ val }) }}
            placeholder='Select a Smart Contract Wallet'
            ConnectButtonPhrase="New Smart Contract Wallet"
            ConnectButtonCallback={() => { console.log('New Smart Contract Wallet') }}
            multiple={true}
            selectAllCheckboxTitle='All Smart Contract Wallets'
            selectAllCheckboxDescription='All current and future SC Wallets'
        />
    </div>
)

export const SCWalletSelectExample = Template.bind({}) as any