import React from 'react'
import { SmartContractWalletSelect } from './SmartContractWalletSelect'
import { CryptoAddressType } from '@proofzero/types/address'

export default {
  title: 'Atoms/SmartContractWalletSelect',
  component: SmartContractWalletSelect,
}

const wallets = Array.from({ length: 10 }, (_, i) => ({
  addressURN: `urn:proofzero:address:${i}`,
  title: `Smart Contract Wallet ${i}`,
  type: CryptoAddressType.Wallet,
}))

const Template = (args: any) => (
  <div className="w-[262px]">
    <SmartContractWalletSelect wallets={wallets} {...args} />
  </div>
)

export const SmartContractWalletSelectExample = Template.bind({}) as any
