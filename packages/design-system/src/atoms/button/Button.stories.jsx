import React from 'react'

// import { BaseTheme } from '../../themes/base-theme/BaseTheme'
import { Button } from './Button'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Atoms/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // alt: { control: 'color' },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  // <BaseTheme>
  <Button {...args}>hello world</Button>
  // </BaseTheme>
)

export const PrimaryButton = Template.bind({})

export const AltPrimaryButton = Template.bind({})
AltPrimaryButton.args = { btnType: 'primary-alt' }

export const SecondaryButton = Template.bind({})
SecondaryButton.args = { btnType: 'secondary' }

export const TertiaryButton = Template.bind({})
TertiaryButton.args = { btnType: 'secondary-alt' }

export const DisabledButton = Template.bind({})
DisabledButton.args = { disabled: true }

export const ExtraSmallButton = Template.bind({})
ExtraSmallButton.args = { btnSize: 'xs' }

export const SmallButton = Template.bind({})
SmallButton.args = { btnSize: 'sm' }

export const LargeButton = Template.bind({})
LargeButton.args = { btnSize: 'l' }

export const ExtraLargeButton = Template.bind({})
ExtraLargeButton.args = { btnSize: 'xl' }
