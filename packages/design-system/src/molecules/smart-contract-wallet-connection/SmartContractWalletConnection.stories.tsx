import React from 'react'
import { SmartContractWalletConnection } from './SmartContractWalletConnection'

export default {
  title: 'Molecules/SmartContractWalletConnection',
  component: SmartContractWalletConnection,
}

const Template = () => {
  return (
    <div className="flex flex-row space-x-9 ">
      <div className="w-[409px] h-[491px] border rounded-lg p-8">
        <SmartContractWalletConnection
          completeCallback={() => {
            console.log('hello')
          }}
        />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
