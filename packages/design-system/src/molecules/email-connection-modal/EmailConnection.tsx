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
  cancelCallback: () => void
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

export const EmailConnection = ({
  providers,
  cancelCallback,
}: EmailConnectionsProps) => {
  const genericEmailProvider = providers.filter(
    (provider) => provider.addr_type === EmailAddressType.Email
  )

  const nonGenericEmailProviders = providers.filter(
    (provider) => provider.addr_type !== EmailAddressType.Email
  )

  return providers.length ? (
    <div
      className="flex flex-col items-center justify-center
    w-full h-full"
    >
      <Text size="xl" weight="medium" className="pb-4">
        Connect New Email
      </Text>
      {genericEmailProvider.length ? (
        <Button
          btnType="secondary-alt"
          className="border rounded-lg flex items-center px-2 h-[50px]
      w-full"
          onClick={genericEmailProvider[0].callback}
        >
          <div
            className="flex flex-row px-2
        items-center w-full space-x-4"
          >
            {iconMapper[genericEmailProvider[0].addr_type]}
            <Text size="lg" className="truncate">
              Connect with Email
            </Text>
          </div>
        </Button>
      ) : null}
      {nonGenericEmailProviders.length && genericEmailProvider.length ? (
        <div className="w-full">
          <div className="my-1 flex flex-row items-center space-x-3 my-1.5">
            <hr className="flex-1 h-px bg-gray-500" />
            <Text>or</Text>
            <hr className="flex-1 h-px bg-gray-500" />
          </div>
        </div>
      ) : null}
      {nonGenericEmailProviders.length ? (
        <div className="w-full">
          <div
            className="flex flex-row items-center
      justify-center space-x-4 mb-4"
          >
            {nonGenericEmailProviders.map((provider) => {
              return (
                <Button
                  key={provider.addr_type}
                  btnType="secondary-alt"
                  onClick={provider.callback}
                  className="flex justify-center items-center
                  border rounded-lg w-full h-[50px]"
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
        onClick={() => {
          cancelCallback()
        }}
        className="border w-full rounded-lg h-[50px] p-2 mt-auto
        flex items-center justify-center"
      >
        <div
          className="flex flex-row px-2 h-[50px]
        items-center space-x-4
        justify-center"
        >
          <Text size="lg" className="truncate">
            Cancel
          </Text>
        </div>
      </Button>
    </div>
  ) : (
    <NestedErrorPage text="No email providers configured" />
  )
}
