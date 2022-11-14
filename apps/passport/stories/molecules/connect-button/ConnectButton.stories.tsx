import React from 'react'

import { ConnectButton } from './ConnectButton'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Molecules/ConnectButton',
  component: ConnectButton,
}

export const ConnectWithWallet = () => {
  return (
    <ConnectButton
      connectCallback={(address) => alert('Connected to wallet' + address)}
      errorCallback={(error) => alert('Error connecting to wallet' + error)}
    />
  )
}
