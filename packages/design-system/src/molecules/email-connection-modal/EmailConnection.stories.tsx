import React from 'react'
import { EmailConnection } from './EmailConnection'

export default {
  title: 'Molecules/EmailConnection',
  component: EmailConnection,

  args: {
    providers: [
      { addr_type: 'email', callback: () => {} },
      { addr_type: 'microsoft', callback: () => {} },
      { addr_type: 'google', callback: () => {} },
    ],
  },
}

const Template = (args) => {
  return (
    <div className="flex flex-row space-x-9 ">
      {args.providers.length ? (
        <div className="w-[409px] h-[491px] border rounded-lg p-8">
          <EmailConnection
            providers={args.providers}
            cancelCallback={() => {}}
          />
        </div>
      ) : (
        <div className="w-[409px] h-[491px]">
          <EmailConnection providers={[]} cancelCallback={() => {}} />
        </div>
      )}
    </div>
  )
}

export const Default = Template.bind({})
