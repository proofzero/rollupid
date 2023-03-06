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
      defaultValue: new Date(2023, 0),
      control: 'date',
    },
  },
}

const Template = (args: any) => <ApplicationListItem {...args} />

export const Default = Template.bind({})
