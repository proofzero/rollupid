import React from 'react'

import { BaseTheme } from '../../themes/base-theme/BaseTheme'
import { Button } from './Button'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Modules/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // alt: { control: 'color' },
  },
}

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => (
  <BaseTheme>
    <Button {...args}>hello world</Button>
  </BaseTheme>
)

export const PrimaryButton = Template.bind({})

export const AltPrimaryButton = Template.bind({})
AltPrimaryButton.args = { alt: true }

export const SecondaryButton = Template.bind({})
SecondaryButton.args = { secondary: true }

export const TertiaryButton = Template.bind({})
TertiaryButton.args = { tertiary: true }

export const DisabledButton = Template.bind({})
DisabledButton.args = { disabled: true }

export const ExtraSmallButton = Template.bind({})
ExtraSmallButton.args = { size: 'xs' }

export const SmallButton = Template.bind({})
SmallButton.args = { size: 'sm' }

export const LargeButton = Template.bind({})
LargeButton.args = { size: 'lg' }

export const ExtraLargeButton = Template.bind({})
ExtraLargeButton.args = { size: 'xl' }
