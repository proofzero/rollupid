import React from 'react'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

import { MdOutlineEmail } from 'react-icons/md'

import { Text } from '../../atoms/text/Text'
import { Button } from '../../build'

export const EmailConnection = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[402px]">
      <Text size="xl" weight="medium" className="pb-4">
        Connect New Email
      </Text>
      <Button btnType="secondary-alt" className="border rounded-lg p-2">
        <div
          className="flex flex-row p-2
        items-center md:w-[328px] space-x-4"
        >
          <MdOutlineEmail size={20} />
          <Text size="lg">Connect with Email</Text>
        </div>
      </Button>
      <div className="my-1 w-[328px] flex flex-row items-center space-x-3">
        <hr className="flex-1 h-px  bg-gray-500" />
        <Text>or</Text>
        <hr className="flex-1 h-px  bg-gray-500" />
      </div>
      <div className="flex flex-row w-[328px] items-center justify-center space-x-4">
        <Button
          btnType="secondary-alt"
          className="flex justify-center border rounded-lg w-[164px]"
        >
          <img src={googleIcon} alt="google" className="py-2" />
        </Button>
        <Button
          btnType="secondary-alt"
          className="flex justify-center border rounded-lg w-[164px]"
        >
          <img src={microsoftIcon} alt="microsoft" className="py-2" />
        </Button>
      </div>
      <Button btnType="secondary-alt" className="border rounded-lg p-2 mt-auto">
        <div
          className="flex flex-row p-2
        items-center min-w-full md:w-[328px] space-x-4
        justify-center"
        >
          <Text size="lg">Cancel</Text>
        </div>
      </Button>
    </div>
  )
}
