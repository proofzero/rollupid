import React from 'react'

import { ReadOnlyInput, ReadOnlyInputProps } from './ReadOnlyInput'

export default {
  title: 'Atoms/Form/ReadOnlyInput',
  component: ReadOnlyInput,
  argTypes: {
    label: {
      defaultValue: 'Label',
    },
    value: {
      defaultValue: 'This is a read-only input',
      type: 'string',
    },
    hidden: {
      defaultValue: false,
      type: 'bool',
      control: 'radio',
      options: [true, false],
    },
  },
}

const Template = (args: ReadOnlyInputProps) => <ReadOnlyInput {...args} />

export const Default = Template.bind({})
