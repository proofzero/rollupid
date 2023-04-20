import React from 'react'
import { ConnectedAccountSelect } from './ConnectedAccountSelect'

export default {
  title: 'Atoms/Account/Select',
  component: ConnectedAccountSelect,
}

const accounts = Array.from({ length: 10 }, (_, i) => ({
  addressURN: `urn:proofzero:address:${i}`,
  title: `Account ${i}`,
  provider: `Provider ${i}`,
  address: `Address ${i}`,
}))

const Template = (args: any) => (
  <div className="w-[262px]">
    <ConnectedAccountSelect accounts={accounts} {...args} />
  </div>
)

export const ConnectedAccountSelectExample = Template.bind({}) as any
