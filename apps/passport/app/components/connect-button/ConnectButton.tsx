import { useEffect } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.png'
import { Avatar } from 'connectkit'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { ConnectKitProvider, ConnectKitButton } from 'connectkit'

import { signMessageTemplate } from '../../routes/connect/$address/sign'

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
    signMessageAsync,
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
              <Button
                btnType="secondary-alt"
                className={classNames('button', className)}
                disabled={isConnected ? !address : isConnecting}
                onClick={
                  isConnected ? () => address && connectCallback(address) : show
                }
                style={{
                  height: 50,
                  width: '100%',
                  fontSize: 16,
                  fontWeight: 500,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {(isSigning || isLoading) && isConnected ? (
                  <>
                    <Spinner />
                    {status !== 'idle' && 'Signing (please check wallet)'}
                  </>
                ) : (
                  <>
                    {ensName && (
                      <span className="mr-[7px]">
                        <Avatar size={20} name={ensName} />
                      </span>
                    )}

                    {!ensName && (
                      <span
                        style={{
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '100%',
                          height: 20,
                          width: 20,
                          margin: '0 7px',
                        }}
                      >
                        <img src={walletsSvg} />
                      </span>
                    )}

                    {isConnected && address
                      ? `Login with ${ensName ?? truncatedAddress}`
                      : !isConnecting
                      ? 'Connect Wallet'
                      : 'Connecting'}
                  </>
                )}
              </Button>
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
                  Disconnect
                </button>
              )}
            </>
          )
        }}
      </ConnectKitButton.Custom>
    </ConnectKitProvider>
  )
}
