import React from 'react'
import { WarningCTA } from './warning'

export default {
  title: 'Molecules/Warning',
  component: WarningCTA,
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
    <WarningCTA
      description={args.description}
      btnText={args.btnText}
      clickHandler={() => {
        return
      }}
    />
  )
}

export const Default = Template.bind({})
