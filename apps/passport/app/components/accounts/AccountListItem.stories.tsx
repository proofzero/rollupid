import React from 'react'
import { AccountListItem } from './AccountListItem'

import { blue } from '@proofzero/design-system/src/placeholders/rollup/b64'

export default {
  title: 'Atoms/Accounts/List item',
  component: AccountListItem,
  argTypes: {
    id: {
      defaultValue: 'Id String',
    },
    title: {
      defaultValue: 'Lorem Ipsum',
    },
    icon: {
      defaultValue: blue,
    },
    wallet: {
      defaultValue: 'Metamask',
    },
    network: {
      defaultValue: 'Ethereum',
    },
    chain: {
      defaultValue: 'Mainnet',
    },
    account: {
      defaultValue: '0x6c60Da9471181Aa54C548c6e201263A5801363F3',
    },
  },
}

const Template = (args: any) => <AccountListItem {...args} />

export const Default = Template.bind({})
