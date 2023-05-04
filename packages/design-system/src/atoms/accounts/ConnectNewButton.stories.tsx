import React from 'react'
import { ConnectNewAccountButton } from './ConnectNewButton'

export default {
  title: 'Atoms/Account/Button',
  component: ConnectNewAccountButton,
}

const Template = () => (
  <div className="w-[262px]">
    <ConnectNewAccountButton
      phrase="Connect New Account"
      onConnectNew={() => {
        return null
      }}
    />
  </div>
)

export const ConnectNewAccountButtonExample = Template.bind({}) as any
