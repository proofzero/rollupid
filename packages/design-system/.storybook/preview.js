import { BaseTheme } from '../src/themes/base-theme/BaseTheme'

const withTheme = (Story, context) => {
  // Get the active theme value from the story parameter
  // const { theme } = context.parameters
  // const storyTheme = theme === 'dark' ? darkTheme : lightTheme
  return (
    <BaseTheme>
      <Story />
    </BaseTheme>
  )
}

export const decorators = [withTheme]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  theme: 'base',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
