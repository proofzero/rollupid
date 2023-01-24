import React from 'react'

import { AuthButton } from './AuthButton'
import tidlogo from './3id.svg'

export default {
  title: 'Components/AuthButton',
  component: AuthButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <AuthButton {...args}>Private Login</AuthButton>

export const AuthButtonExample = Template.bind({})
AuthButtonExample.args = { logo: tidlogo }
