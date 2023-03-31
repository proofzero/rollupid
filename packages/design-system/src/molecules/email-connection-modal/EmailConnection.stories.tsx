import React from 'react'
import { EmailConnection } from './EmailConnection'

export default {
  title: 'Molecules/EmailConnection',
  component: EmailConnection,
  args: {
    providers_fulfilled: [
      { addr_type: 'email', callback: () => {} },
      { addr_type: 'microsoft', callback: () => {} },
      { addr_type: 'google', callback: () => {} },
    ],
    providers_empty: [],
  },
}

const Template = (args) => {
  return (
    <div className="flex flex-row space-x-9 ">
      <div className="w-[409px] h-[491px] border rounded-lg p-8">
        <EmailConnection providers={args.providers_fulfilled} />
      </div>
      <div className="w-[409px] h-[491px]">
        <EmailConnection providers={args.providers_empty} />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
