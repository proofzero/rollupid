import React from 'react'
import { EmailSelect } from './EmailSelect'

import { OAuthAddressType, EmailAddressType } from '@proofzero/types/address'

export default {
  title: 'Atoms/Email/Select',
  component: EmailSelect,
}

const listItems = [
  {
    type: OAuthAddressType.Google,
    email: 'email@gmail.com',
  },
  {
    type: OAuthAddressType.Microsoft,
    email: 'email@microsoft.com',
  },
  {
    type: EmailAddressType.Email,
    email: 'email@yahoo.com',
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
