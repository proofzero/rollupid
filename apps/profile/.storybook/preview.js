import '../app/styles/tailwind.css'
import '@proofzero/design-system/src/styles/global.css'
// import '../app/components/FAQ/FAQ.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
