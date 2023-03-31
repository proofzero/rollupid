import React from 'react'
import { EmailConnection } from './EmailConnection'

export default {
  title: 'Molecules/EmailConnection',
  component: EmailConnection,
}

const Template = () => {
  return (
    <div className="w-[409px] h-[491px] border rounded-lg p-8">
      <EmailConnection
        providers={[
          { addr_type: 'microsoft', callback: () => {} },
          { addr_type: 'email', callback: () => {} },
          { addr_type: 'google', callback: () => {} },
        ]}
      />
    </div>
  )
}

export const Default = Template.bind({})
