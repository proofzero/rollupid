import React from 'react'
import { AddressListItem } from './AddressListItem'

export default {
  title: 'Atoms/Addresses/List item',
  component: AddressListItem,
  argTypes: {
    id: {
      defaultValue: 'Id String',
    },
    title: {
      defaultValue: 'Lorem Ipsum',
    },
    icon: {
      defaultValue: 'https://picsum.photos/250',
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
    address: {
      defaultValue: '0x6c60Da9471181Aa54C548c6e201263A5801363F3',
    },
  },
}

const Template = (args: any) => <AddressListItem {...args} />

export const Default = Template.bind({})
