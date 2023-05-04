import React from 'react'
import { EmailSelect } from './EmailSelect'

import { OAuthAddressType, EmailAddressType } from '@proofzero/types/address'
import { EmailSelectListItem } from '@proofzero/utils/getNormalisedConnectedAccounts'

export default {
  title: 'Atoms/Email/Select',
  component: EmailSelect,
}

const listItems: EmailSelectListItem[] = [
  {
    type: OAuthAddressType.Google,
    email: 'email@gmail.com',
    addressURN: 'urn:rollupid:address/1',
  },
  {
    type: OAuthAddressType.Microsoft,
    email: 'email@microsoft.com',
    addressURN: 'urn:rollupid:address/2',
  },
  {
    type: EmailAddressType.Email,
    email: 'email@yahoo.com',
    addressURN: 'urn:rollupid:address/3',
  },
  {
    type: EmailAddressType.Email,
    email: 'email@gmail.com',
    addressURN: 'urn:rollupid:address/4',
  },
]

const Template = (args: any) => (
  <div className="w-[262px]">
    <EmailSelect items={listItems} {...args} />
  </div>
)

export const EmailSelectExample = Template.bind({}) as any
EmailSelectExample.args = {
  enableAddNew: true,
}
