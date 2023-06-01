import React, { useContext, useEffect } from 'react'

import type { ButtonProps } from '@proofzero/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.png'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { Avatar, ConnectKitButton } from 'connectkit'

import { useDisconnect, useSignMessage } from "wagmi"

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Popover } from '@headlessui/react'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { ThemeContext } from '../../../contexts/theme'

import { signMessageTemplate } from '@proofzero/packages/utils'

export type ConnectButtonProps = {
  connectCallback: (address: string) => void
  signCallback: (
    address: string,
    signature: string,
    nonce: string,
    state: string
  ) => void
  connectErrorCallback: (error: Error) => void
  disabled?: boolean
  signData?: {
    nonce: string | undefined
    state: string | undefined
    address: string | undefined
    signature: string | undefined
  }
  isLoading?: boolean
  className?: string
  fullSize?: boolean
  displayContinueWith?: boolean
} & ButtonProps

export function ConnectButton({
  connectCallback,
  connectErrorCallback,
  signCallback,
  isLoading,
  signData,
  fullSize = true,
  displayContinueWith = false,
}: ConnectButtonProps) {
  const { disconnect } = useDisconnect()
  const {
    isLoading: isSigning,
    signMessage,
  } = useSignMessage({
    onSuccess(data) {
      console.debug('message signed')
      if (!signData?.nonce ||
        !signData?.state ||
        !signData?.address) {
        connectErrorCallback(new Error('No signature data present.'))
        return
      }
      console.debug('sign callback')
      signCallback(
        signData.address,
        data,
        signData.nonce,
        signData.state
      )
    },
    onError(error) {
      console.debug('should sign?', { error, isSigning })
      if (error && !isSigning) {
        connectErrorCallback(error)
      }
    },
  })
  useEffect(() => {
    if (!signData?.signature && signData?.nonce) {
      console.debug('signing...')
      const nonceMessage = signMessageTemplate().replace(
        '{{nonce}}',
        signData.nonce
      )
      // sign message
      signMessage({ message: nonceMessage })
    } else {
      console.debug('no sign data')
    }
  }, [signData])


  const { theme, dark } = useContext(ThemeContext)

  return (
    < div
      className={`box-border rounded-md shadow-sm border border-solid border-[#d1d5db] bg-white dark:bg-[#374151] dark:border-gray-600 h-[56px]`
      }
    >
      <ConnectKitButton.Custom>
        {({
          isConnected,
          isConnecting,
          show,
          hide,
          address,
          truncatedAddress,
          ensName,
        }) => {
          if (isConnected) {
            hide!()
          }
          return (
            <div className="flex flex-row h-full">
              <button
                type="button"
                disabled={isConnecting || isSigning || isLoading}
                onClick={
                  isConnected
                    ? () => {
                      return address && connectCallback(address)
                    }
                    : show
                }
                className={`flex-1 button hover:bg-gray-100 flex flex-row items-center space-x-3 px-[17px] rounded-l-md ${isConnected ? '' : 'rounded-r-md'
                  } ${fullSize ? 'justify-start' : 'justify-center'
                  } bg-white dark:bg-[#374151] dark:border-gray-600 hover:bg-gray-100 focus:bg-white focus:ring-inset focus:ring-2 focus:ring-skin-primary truncate`}
              >
                {(isSigning || isLoading) && isConnected ? (
                  <Spinner size={16} />
                ) : (
                  <div>
                    {!ensName && <img src={walletsSvg} className="w-5 h-5" />}
                    {ensName && <Avatar size={20} name={ensName} />}
                  </div>
                )}

                {fullSize && (
                  <Text
                    weight="medium"
                    className="flex-1 text-start text-gray-800 dark:text-white truncate"
                  >
                    {(isSigning || isLoading) && isConnected
                      ? isSigning
                        ? 'Signing... (please check wallet)'
                        : 'Continuing...'
                      : isConnected && address
                        ? `${displayContinueWith ? `Continue with ` : ''}${ensName ?? truncatedAddress
                        }`
                        : !isConnecting
                          ? `${displayContinueWith ? `Continue with ` : ''}Wallet`
                          : 'Connecting'}
                  </Text>
                )}
              </button>

              {isConnected && (
                <Popover>
                  {({ open }) => (
                    <>
                      <Popover.Button className="h-full px-2 lg:px-3.5 flex justify-center items-center rounded-r-md bg-white dark:bg-[#374151] dark:border-gray-600 text-[#1f2937] shadow-sm border-l hover:bg-gray-100  focus:bg-white focus:ring-inset focus:ring-2 focus:ring-indigo-500">
                        {!open && <HiChevronDown className="w-5 h-5" />}
                        {open && (
                          <HiChevronUp className="w-5 h-5 text-indigo-500" />
                        )}
                      </Popover.Button>
                      <Popover.Panel className="absolute top-16 left-0 right-0 z-10 bg-white dark:bg-[#374151] dark:border-gray-600 rounded-md shadow-md">
                        <button
                          className="w-full px-[17px] py-5"
                          onClick={() => {
                            disconnect()
                          }}
                        >
                          <Text
                            size="sm"
                            weight="normal"
                            className="text-red-600 text-start"
                          >{`Disconnect ${ensName ?? truncatedAddress
                            }`}</Text>
                        </button>
                      </Popover.Panel>
                    </>
                  )}
                </Popover>
              )}
            </div>
          )
        }}
      </ConnectKitButton.Custom>
    </div>
  )
}
