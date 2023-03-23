import { useEffect } from 'react'
import type { ButtonProps } from '@proofzero/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.png'
import { Avatar } from 'connectkit'
import { Spinner } from '@proofzero/design-system/src/atoms/spinner/Spinner'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'

import { signMessageTemplate } from '../../routes/connect/$address/sign'
import AuthButton from './AuthButton'

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
} & ButtonProps

export function ConnectButton({
  connectCallback,
  connectErrorCallback,
  signCallback,
  isLoading,
  className,
  signData,
}: ConnectButtonProps) {
  const { connector, isConnected, isReconnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const {
    isLoading: isSigning,
    error,
    status,
    signMessage,
    reset,
  } = useSignMessage({
    onSuccess(data, variables) {
      console.debug('message signed')
      if (!signData?.nonce || !signData?.state || !signData?.address) {
        connectErrorCallback(new Error('No signature data present.'))
        return
      }
      console.debug('sign callback')
      signCallback(signData.address, data, signData.nonce, signData.state)
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
      const nonceMessage = signMessageTemplate.replace(
        '{{nonce}}',
        signData.nonce
      )
      // sign message
      signMessage({ message: nonceMessage })
    } else {
      console.debug('no sign data')
    }
  }, [signData, isReconnecting, isConnected, connector, signMessage])

  return (
    <ConnectKitProvider>
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
            <>
              <AuthButton
                disabled={isConnecting || isSigning || isLoading}
                onClick={
                  isConnected ? () => address && connectCallback(address) : show
                }
                Graphic={
                  (isSigning || isLoading) && isConnected ? (
                    <Spinner size={16} />
                  ) : (
                    <>
                      {!ensName && <img src={walletsSvg} />}
                      {ensName && <Avatar size={20} name={ensName} />}
                    </>
                  )
                }
                text={
                  (isSigning || isLoading) && isConnected
                    ? isSigning
                      ? 'Signing... (please check wallet)'
                      : 'Continuing...'
                    : isConnected && address
                    ? `Continue with ${ensName ?? truncatedAddress}`
                    : !isConnecting
                    ? 'Connect Wallet'
                    : 'Connecting'
                }
              />

              {isConnected && (
                <button
                  className={
                    'text-xs text-indigo-400 underline -mt-2 cursor-pointer'
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    disconnect()
                  }}
                >
                  Disconnect Wallet
                </button>
              )}
            </>
          )
        }}
      </ConnectKitButton.Custom>
    </ConnectKitProvider>
  )
}
