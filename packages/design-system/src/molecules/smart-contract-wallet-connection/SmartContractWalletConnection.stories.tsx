import React from 'react'
import { SmartContractWalletCreationSummary } from './SmartContractWalletConnection'

export default {
  title: 'Molecules/SmartContractWalletCreationSummary',
  component: SmartContractWalletCreationSummary,
}

const Template = () => {
  return (
    <div className="flex flex-row space-x-9 ">
      <div className="w-[409px] h-[491px] border rounded-lg p-8">
        <SmartContractWalletCreationSummary
          placeholder="placeholder"
          onChange={(e) => {
            console.log(e)
          }}
          onSubmit={() => {
            console.log('test')
          }}
        />
      </div>
    </div>
  )
}

export const Default = Template.bind({})
