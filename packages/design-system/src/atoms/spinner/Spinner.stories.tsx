import React from 'react'

import { Spinner, SpinnerProps } from './Spinner'

export default {
  title: 'Atoms/Spinner',
  component: Spinner,
  argTypes: {
    color: {
      defaultValue: '#000000',
    },
  },
}

const Template = (args: SpinnerProps) => <Spinner {...args} />

export const Default = Template.bind({})
