import React, { FC } from 'react'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'

import { MdOutlineEmail } from 'react-icons/md'
import { Text } from '../../atoms/text/Text'
import { Button } from '../../build'

import { EmailAddressType, OAuthAddressType } from '@proofzero/types/address'
import { NestedErrorPage } from '../../pages/nested-error/NestedErrorPage'

type NonEmptyArray<T> = [T, ...T[]]

export type EmailConnectionProps = {
  addr_type:
    | EmailAddressType.Email
    | OAuthAddressType.Google
    | OAuthAddressType.Microsoft
  callback: () => void
}

export type EmailConnectionsProps = {
  providers: NonEmptyArray<EmailConnectionProps>
}

const iconMapper = {
  [OAuthAddressType.Google]: (
    <img src={googleIcon} alt="google" className="my-2" />
  ),
  [OAuthAddressType.Microsoft]: (
    <img src={microsoftIcon} alt="microsoft" className="my-2" />
  ),
  [EmailAddressType.Email]: <MdOutlineEmail size={24} className="my-2" />,
}

export const EmailConnection = ({ providers }: EmailConnectionsProps) => {
  return providers.length ? (
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
        onClick={providers[0].callback}
      >
        <div
          className="flex flex-row p-2
        items-center w-full space-x-4"
        >
          {iconMapper[providers[0].addr_type]}
          <Text size="lg">Connect with Email</Text>
        </div>
      </Button>
      {providers.length > 1 ? (
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
            {providers.slice(1).map((provider) => {
              return (
                <Button
                  key={provider.addr_type}
                  btnType="secondary-alt"
                  onClick={provider.callback}
                  className="flex justify-center border rounded-lg w-full"
                >
                  {iconMapper[provider.addr_type]}
                </Button>
              )
            })}
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
  ) : (
    <NestedErrorPage text="No email providers configured" />
  )
}
