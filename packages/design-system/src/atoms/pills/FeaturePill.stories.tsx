import React from 'react'
import { FeaturePill } from './FeaturePill'

export default {
  title: 'Atoms/Pills/Feature',
  component: FeaturePill,
  argTypes: {
    text: {
      defaultValue: 'Lorem Ipsum',
    },
  },
}

const Template = (args) => <FeaturePill {...args} />

export const Default = Template.bind({})
