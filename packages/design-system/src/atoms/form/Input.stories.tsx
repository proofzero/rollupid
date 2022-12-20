import React from 'react'
import { Input, InputProps } from './Input'

export default {
  title: 'Atoms/Form/Input',
  component: Input,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
  },
}

const Template = (args: InputProps) => <Input {...args} />

export const Default = Template.bind({})
