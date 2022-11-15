import '../app/styles/global.css'

import { GlobalStyle } from '@kubelt/design-system/src/styles/GlobalStyles'

const withTheme = (Story, context) => {
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
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
