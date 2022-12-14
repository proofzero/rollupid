import React from 'react'
import { NewAppModal } from './NewAppModal'

export default {
  title: 'Molecules/New App Modal/',
  component: NewAppModal,
  argTypes: {
    isOpen: {
      defaultValue: false,
    },
    newAppCreateCallback: {
      defaultValue: () => {},
    },
  },
}

const Template = (args: any) => <NewAppModal {...args} />

export const Default = Template.bind({})
