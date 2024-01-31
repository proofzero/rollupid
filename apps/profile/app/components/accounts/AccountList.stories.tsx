import React from 'react'
import { AccountList } from './AccountList'
import type { AccountListItemProps } from './AccountListItem'

import {
  blue,
  gray,
  green,
} from '@proofzero/design-system/src/placeholders/rollup/b64'

export default {
  title: 'Molecules/Accounts/List',
  component: AccountList,
}

const accounts: AccountListItemProps[] = [
  {
    id: '1',
    title: 'Ondrej.eth',
    icon: blue,
    wallet: 'Metamask',
    network: 'Ethereum',
    chain: 'Mainnet',
    account: '0x3c153bE191088a34bAc04013b511EF538718d645',
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
    icon: gray,
    wallet: 'Metamask',
    network: 'Ethereum',
    chain: 'Mainnet',
    account: '0x2062dDb9924991c5CfB6af89A12FB4F405965d3d',
    onRenameAccount: (id) => {},
    onChangeAvatar: (id) => {},
    onDisconnect: (id) => {},
  },
  {
    id: '3',
    title: 'Account 3',
    icon: green,
    wallet: 'Metamask',
    network: 'Polygon',
    chain: 'Mainnet',
    account: '0x012AC2a88F9244f004255b29AFCD349beE097B48',
    hidden: true,
  },
]

const Template = () => <AccountList accounts={accounts} />

export const Default = Template.bind({})
