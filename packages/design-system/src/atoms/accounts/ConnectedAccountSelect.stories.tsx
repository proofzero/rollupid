import React from 'react'
import { ConnectedAccountSelect } from './ConnectedAccountSelect'

export default {
  title: 'Atoms/Account/Select',
  component: ConnectedAccountSelect,
}

const Template = (args: any) => (
  <div className="w-[262px]">
    <ConnectedAccountSelect {...args} />
  </div>
)

export const ConnectedAccountSelectExample = Template.bind({}) as any
