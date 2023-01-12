import React from 'react'
import { PrimaryPill } from './PrimaryPill'

export default {
  title: 'Atoms/Pills/Primary',
  component: PrimaryPill,
  argTypes: {
    text: {
      defaultValue: 'Lorem Ipsum',
    },
  },
}

const Template = (args) => <PrimaryPill {...args} />

export const Default = Template.bind({})
