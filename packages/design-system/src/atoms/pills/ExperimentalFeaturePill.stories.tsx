import React from 'react'
import { ExperimentalFeaturePill } from './ExperimentalFeaturePill'

export default {
  title: 'Atoms/Pills/ExperimentalFeature',
  component: ExperimentalFeaturePill,
  argTypes: {
    text: {
      defaultValue: 'Lorem Ipsum',
    },
  },
}

const Template = (args) => (
  <ExperimentalFeaturePill className="bg-gray-100" {...args} />
)

export const Default = Template.bind({})
