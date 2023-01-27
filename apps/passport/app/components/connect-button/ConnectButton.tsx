import { useState } from 'react'
import classNames from 'classnames'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import type { ButtonProps } from '@kubelt/design-system/src/atoms/buttons/Button'

import walletsSvg from './wallets.svg'

async function getConnectKit() {
  let _connectKit: any
  if (!_connectKit) {
    _connectKit = await import('connectkit')
  }
  return _connectKit
}
async function getWagmiKit() {
  let _wagmi: any
  if (!_wagmi) {
    _wagmi = await import('wagmi')
  }
  return _wagmi
}

export type ConnectButtonProps = {
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
  disabled?: boolean
  provider?: string
  className?: string
} & ButtonProps

export function ConnectButton({
  disabled = false,
  connectCallback,
  connectErrorCallback,
  provider,
  className,
  ...rest
}: ConnectButtonProps) {
  const [wagmi, setWagmi] = useState({
    useAccount: () => ({
      address: '' as `0x${string}`,
      isConnected: false,
      isConnecting: false,
      isDisconnected: false,
      status: '',
    }),
    useConnect: () => ({
      error: null as Error | null,
    }),
    useDisconnect: () => ({
      disconnect: () => {},
    }),
  })
  const [connectKit, setConnectKit] = useState<typeof import('connectkit')>()

  const loadWeb3 = () => async () => {
    console.log('lazy loading web3')
    const w = await getWagmiKit()
    const c = await getConnectKit()
    setWagmi(w)
    setConnectKit(c)
  }
  loadWeb3()()

  if (wagmi && connectKit && typeof document !== 'undefined') {
    return (
      <connectKit.ConnectKitProvider>
        <connectKit.ConnectKitButton.Custom>
          {({ isConnected, isConnecting, show, hide, address, ensName }) => {
            if (isConnected && address) {
              connectCallback(address)
            }

            return (
              <Button
                btnType="secondary-alt"
                className={classNames('button', className)}
                disabled={isConnecting}
                onClick={show}
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
                {!isConnecting ? 'Connect With Wallet' : 'Connecting'}
              </Button>
            )
          }}
        </connectKit.ConnectKitButton.Custom>
      </connectKit.ConnectKitProvider>
    )
  } else return <></>
}
