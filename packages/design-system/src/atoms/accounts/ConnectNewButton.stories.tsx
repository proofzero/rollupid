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
      onClick={() => {
        return null
      }}
    />
  </div>
)

export const ConnectedAccountSelectExample = Template.bind({}) as any
