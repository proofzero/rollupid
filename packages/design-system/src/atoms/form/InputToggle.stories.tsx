import React from 'react'
import { InputToggle, InputToggleProps } from './InputToggle'

export default {
  title: 'Atoms/Form/InputToggle',
  component: InputToggle,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
  },
}

const Template = (args: InputToggleProps) => <InputToggle {...args} />

export const Default = Template.bind({})
