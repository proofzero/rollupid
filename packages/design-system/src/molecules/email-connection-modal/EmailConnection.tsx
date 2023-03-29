import React from 'react'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

import { MdOutlineEmail } from 'react-icons/md'

import { Text } from '../../atoms/text/Text'
import { Button } from '../../build'

export type EmailConnectionProps = {
  microsoft?: boolean
  google?: boolean
}

export const EmailConnection = ({
  microsoft = true,
  google = true,
}: EmailConnectionProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center
    w-full h-full"
    >
      <Text size="xl" weight="medium" className="pb-4">
        Connect New Email
      </Text>
      <Button
        btnType="secondary-alt"
        className="border rounded-lg p-2
      w-full"
      >
        <div
          className="flex flex-row p-2
        items-center w-full space-x-4"
        >
          <MdOutlineEmail size={22} />
          <Text size="lg">Connect with Email</Text>
        </div>
      </Button>
      {microsoft || google ? (
        <div className="w-full">
          <div className="my-1 flex flex-row items-center space-x-3 my-1.5">
            <hr className="flex-1 h-px bg-gray-500" />
            <Text>or</Text>
            <hr className="flex-1 h-px bg-gray-500" />
          </div>
          <div
            className="flex flex-row items-center
      justify-center space-x-4 mb-4"
          >
            {google ? (
              <Button
                btnType="secondary-alt"
                className="flex justify-center border rounded-lg w-full"
              >
                <img src={googleIcon} alt="google" className="py-2" />
              </Button>
            ) : null}
            {microsoft ? (
              <Button
                btnType="secondary-alt"
                className="flex justify-center border rounded-lg w-full"
              >
                <img src={microsoftIcon} alt="microsoft" className="py-2" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <Button
        btnType="secondary-alt"
        className="border w-full rounded-lg p-2 mt-auto"
      >
        <div
          className="flex flex-row p-2
        items-center space-x-4
        justify-center"
        >
          <Text size="lg">Cancel</Text>
        </div>
      </Button>
    </div>
  )
}
