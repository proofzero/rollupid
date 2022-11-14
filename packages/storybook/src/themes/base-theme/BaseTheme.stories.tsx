import React from 'react'

import { BaseTheme } from './BaseTheme'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Themes/BaseTheme',
  component: BaseTheme,
}

export const ColorScheme = () => {
  return <BaseTheme>Hello World</BaseTheme>
}
