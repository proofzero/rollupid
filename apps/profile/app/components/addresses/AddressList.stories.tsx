import React from 'react'
import { AddressList } from './AddressList'
import type { AddressListItemProps } from './AddressListItem'

export default {
  title: 'Molecules/Addresses/List',
  component: AddressList,
}

const addresses: AddressListItemProps[] = [
  {
    id: '1',
    title: 'Ondrej.eth',
    icon: 'https://picsum.photos/250/250',
    wallet: 'Metamask',
    network: 'Ethereum',
    chain: 'Mainnet',
    address: '0x3c153bE191088a34bAc04013b511EF538718d645',
    primary: true,
    onRenameAccount: (id) => {},
    onChangeAvatar: (id) => {},
    onSetPrimary: (id) => {},
    onSetPrivate: (id) => {},
    onDisconnect: (id) => {},
  },
  {
    id: '2',
    title: 'Account 2',
    icon: 'https://picsum.photos/250/250',
    wallet: 'Metamask',
    network: 'Ethereum',
    chain: 'Mainnet',
    address: '0x2062dDb9924991c5CfB6af89A12FB4F405965d3d',
    onRenameAccount: (id) => {},
    onChangeAvatar: (id) => {},
    onDisconnect: (id) => {},
  },
  {
    id: '3',
    title: 'Account 3',
    icon: 'https://picsum.photos/250/250',
    wallet: 'Metamask',
    network: 'Polygon',
    chain: 'Mainnet',
    address: '0x012AC2a88F9244f004255b29AFCD349beE097B48',
    hidden: true,
  },
]

const Template = () => <AddressList addresses={addresses} />

export const Default = Template.bind({})
