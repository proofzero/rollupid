import React from 'react'
import { SmartContractWalletSelect } from './SmartContractWalletSelect'

export default {
  title: 'Atoms/SmartContractWallet/Select',
  component: SmartContractWalletSelect,
}

const wallets = Array.from({ length: 10 }, (_, i) => ({
  addressURN: `urn:proofzero:address:${i}`,
  title: `Smart Contract Wallet ${i}`,
  provider: `Provider ${i}`,
  address: `Address ${i}`,
}))

const Template = (args: any) => (
  <div className="w-[262px]">
    <SmartContractWalletSelect wallets={wallets} {...args} />
  </div>
)

export const SmartContractWalletSelectExample = Template.bind({}) as any
