import React from 'react'
import { Dropdown, DropdownSelectListItem } from './DropdownSelectList'

import { CryptoAddressType } from '@proofzero/types/address'

export default {
    title: 'Atoms/Dropdown/SmartContractWallets',
    component: Dropdown,
}

const modifyType = (string: string) => {
    if (string === CryptoAddressType.Wallet) {
        return "SC Wallet"
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
}

const accounts: DropdownSelectListItem[] = Array.from({ length: 10 }, (_, i) => ({
    value: `urn:proofzero:address:${i}`,
    title: `Smart Contract Wallet ${i}`,
    subtitle: `${modifyType(CryptoAddressType.Wallet as string)} - SC Wallet: ${i}`
}))

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            items={accounts}
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