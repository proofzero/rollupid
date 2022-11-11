import React from 'react'

import { getDefaultProvider } from 'ethers'
import { Authentication, SocialLoginProviders } from './Authentication'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Authentication',
  component: Authentication,
}

export const BasicAuthentication = () => {
  return (
    <Authentication
      provider={getDefaultProvider()}
      socialLoginProviders={[SocialLoginProviders.GOOGLE]}
    />
  )
}
