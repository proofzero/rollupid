import React from 'react'
import scWalletIcon from '@proofzero/design-system/src/assets/social_icons/sc_wallet.svg'

import { Text } from '../../atoms/text/Text'
import { Button } from '../../build'

import { Input } from '../../atoms/form/Input'

export const SmartContractWalletCreationSummary = ({
  onChange,
  onSubmit,
  disabled,
}: {
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}) => {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex flex-col dark:text-white items-center w-full h-full space-y-2">
        <img
          src={scWalletIcon}
          alt="sc_wallet"
          className="mt-6 mb-4 w-10 h-10"
        />

        <Text size="xl" weight="medium">
          Smart Contract Wallet
        </Text>
        <Text weight="medium">We will create a smart wallet for you</Text>
        <Text className="text-gray-500">
          You will find all wallet details in your profile.
        </Text>
        <div className="w-full py-4">
          <Input
            label="Name your Wallet"
            id="nickname"
            className="h-[50px] rounded border"
            onChange={(e) => onChange(e.currentTarget.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter' && !disabled) {
                onSubmit()
              }
            }}
          />
          <label>
            <Text size="sm" weight="medium" className="text-gray-400 my-2">
              Name must be at least 4 characters long
            </Text>
          </label>
        </div>
      </div>

      <Button
        btnType="primary-alt-skin"
        type="button"
        className="border w-full rounded-lg h-[50px] p-2 mt-auto
        flex items-center justify-center"
        disabled={disabled}
        onClick={onSubmit}
      >
        <div
          className="flex flex-row px-2 h-[50px]
        items-center space-x-4
        justify-center"
        >
          <Text size="lg" className="truncate">
            Complete
          </Text>
        </div>
      </Button>
    </div>
  )
}
