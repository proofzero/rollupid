import { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  return null
}

export default function Index() {
  // Setup client for connecting to wallets
  const { chains, provider, webSocketProvider } = configureChains(
    defaultChains,
    [publicProvider()] // TODO: add non default provider selection via props
  )
  const client = createClient({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Injected',
          shimDisconnect: true,
        },
      }),
    ],
    provider,
    webSocketProvider,
  })
  return (
    <div className={'flex flex-col h-screen justify-center items-center'}>
      <WagmiConfig client={client}>
        <Outlet />
      </WagmiConfig>
    </div>
  )
}
