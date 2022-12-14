import React from 'react'
import { PreLabeledInput, PreLabeledInputProps } from './PreLabledInput'

export default {
  title: 'Atoms/Form/PreLabeledInput',
  component: PreLabeledInput,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
    preLabel: {
      defaultValue: 'http://',
    },
  },
}

const Template = (args: PreLabeledInputProps) => <PreLabeledInput {...args} />

export const Default = Template.bind({})
