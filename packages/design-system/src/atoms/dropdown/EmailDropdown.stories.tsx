import React from 'react'
import { Dropdown, DropdownSelectListItem } from './DropdownSelectList'

import {
  OAuthAccountType,
  EmailAccountType,
  CryptoAccountType,
} from '@proofzero/types/account'
import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'

export default {
  title: 'Atoms/Dropdown/Email',
  component: Dropdown,
}

const getIcon = (
  type?: OAuthAccountType | EmailAccountType | CryptoAccountType
): JSX.Element => {
  return type ? (
    type === OAuthAccountType.Microsoft ? (
      <img src={microsoftIcon} className="w-4 h-4 mr-3" />
    ) : type === OAuthAccountType.Apple ? (
      <img src={appleIcon} className="w-4 h-4 mr-3" />
    ) : type === OAuthAccountType.Google ? (
      <img src={googleIcon} className="w-4 h-4 mr-3" />
    ) : type === EmailAccountType.Email ? (
      <HiOutlineEnvelope className="w-4 h-4 mr-3" />
    ) : null
  ) : null
}

const listItems: Array<DropdownSelectListItem> = [
  {
    title: 'email@gmail.com',
    value: 'urn:rollupid:account/1',
    icon: getIcon(OAuthAccountType.Google),
  },
  {
    title: 'email@microsoft.com',
    value: 'urn:rollupid:account/2',
    icon: getIcon(OAuthAccountType.Microsoft),
  },
  {
    title: 'perez@apple.com',
    value: 'urn:rollupid:account/5',
    icon: getIcon(OAuthAccountType.Apple),
  },
  {
    title: 'email@yahoo.com',
    value: 'urn:rollupid:account/3',
    icon: getIcon(EmailAccountType.Email),
    selected: true,
  },
  {
    title: 'email@gmail.com',
    value: 'urn:rollupid:account/4',
    icon: getIcon(EmailAccountType.Email),
  },
]

const Template = () => (
  <div className="w-[280px]">
    <Dropdown
      items={listItems}
      onSelect={(val) => {
        console.log({ val })
      }}
      placeholder="Select an Email Address"
      ConnectButtonPhrase="Connect New Email Account"
      ConnectButtonCallback={() => {
        console.log('Connect New Email Account')
      }}
    />
  </div>
)

export const EmailSelectExample = Template.bind({}) as any
