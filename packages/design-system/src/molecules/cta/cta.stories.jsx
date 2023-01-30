import React from 'react'
import { CTA } from './cta'

export default {
  title: 'Molecules/CTA',
  component: CTA,
  argTypes: {
    header: {
      defaultValue: 'Hellob',
      control: { type: 'text' },
    },
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
    <CTA
      header={args.header}
      description={args.description}
      btnText={args.btnText}
      clickHandler={() => {
        return
      }}
    />
  )
}

export const Default = Template.bind({})
