import '../src/styles/global.css'

import { GlobalStyle } from '../src/styles/GlobalStyles'

const withTheme = (Story, context) => {
  // Get the active theme value from the story parameter
  // const { theme } = context.parameters
  // const storyTheme = theme === 'dark' ? darkTheme : lightTheme
  return (
    <>
      <GlobalStyle />
      <Story />
    </>
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
