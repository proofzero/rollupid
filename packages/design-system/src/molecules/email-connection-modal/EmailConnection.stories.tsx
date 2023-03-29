import React from 'react'
import { EmailConnection } from './EmailConnection'

export default {
  title: 'Molecules/EmailConnection',
  component: EmailConnection,
  argTypes: {
    microsoft: true,
    google: true,
  },
}

const Template = (args) => {
  console.log(args)
  return (
    <div className="w-[409px] h-[491px] border rounded-lg p-8">
      <EmailConnection microsoft={args.microsoft} google={args.google} />
    </div>
  )
}

export const Default = Template.bind({})
