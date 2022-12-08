import React from 'react'

import { ErrorPage } from './ErrorPage'

export default {
  title: 'Pages/Error',
  component: ErrorPage,
  argTypes: {
    code: {
      defaultValue: '404',
    },
    message: {
      defaultValue: 'Page not found',
    },
  },
}

const Template = (args) => <ErrorPage {...args} />

export const Default = Template.bind({})
