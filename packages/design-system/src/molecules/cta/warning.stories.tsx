import React from 'react'
import { Warning } from './warning'

export default {
  title: 'Molecules/Warning',
  component: Warning,
  argTypes: {

    description: {
      defaultValue: 'Book',
      control: { type: 'text' },
    },
    btnText: {
      defaultValue: 'Click',
      control: { type: 'text' },
    },
  },
}

const Template = (args) => {
  console.log(args)
  return (
    <Warning
      description={args.description}
      btnText={args.btnText}
      clickHandler={() => {
        return
      }}
    />
  )
}

export const Default = Template.bind({})
