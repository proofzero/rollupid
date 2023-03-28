import React from 'react'
import { EmailConnection } from './EmailConnection'

export default {
  title: 'Molecules/EmailConnection',
  component: EmailConnection,
}

const Template = (args) => {
  console.log(args)
  return <EmailConnection />
}

export const Default = Template.bind({})
