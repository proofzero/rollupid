import '../src/styles/global.css'

const withTheme = (Story, context) => {
  // Get the active theme value from the story parameter
  // const { theme } = context.parameters
  // const storyTheme = theme === 'dark' ? darkTheme : lightTheme
  return (
    <>
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
