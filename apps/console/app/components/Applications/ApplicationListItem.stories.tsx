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
      defaultValue: new Date(),
      control: 'date',
    },
  },
}

const Template = (args: any) => <ApplicationListItem {...args} />

export const Default = Template.bind({})
