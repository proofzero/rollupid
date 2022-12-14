import React from 'react'
import { TextInput, TextInputProps } from './TextInput'

export default {
  title: 'Atoms/Form/TextInput',
  component: TextInput,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
  },
}

const Template = (args: TextInputProps) => <TextInput {...args} />

export const Default = Template.bind({})
