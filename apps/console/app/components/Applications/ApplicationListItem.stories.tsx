import React from 'react'
import { ApplicationListItem } from './ApplicationListItem'

export default {
  title: 'Atoms/Applications/List item',
  component: ApplicationListItem,
  argTypes: {
    title: {
      defaultValue: 'Loremipsum',
    },
    created: {
      defaultValue: 1672549200000,
      control: 'date',
    },
  },
}

const Template = (args: any) => <ApplicationListItem {...args} />

export const Default = Template.bind({})
