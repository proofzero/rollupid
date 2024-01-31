import { getDefaultConfig, ConnectKitProvider } from 'connectkit'
import { useHydrated } from 'remix-utils'
import { createConfig, WagmiConfig } from 'wagmi'
import {
  mainnet,
  polygon,
  optimism,
  filecoin,
  arbitrum,
} from '@wagmi/core/chains'

export function LazyAuth({
  autoConnect = false,
  children,
}: {
  context?: any
  autoConnect?: boolean
  children: JSX.Element
}) {
  const hydrated = useHydrated()
  if (!hydrated) return null

  const config = createConfig(
    getDefaultConfig({
      appName: 'Rollup',
      autoConnect,
      alchemyId: window.ENV.APIKEY_ALCHEMY_PUBLIC,
      walletConnectProjectId: window.ENV.WALLET_CONNECT_PROJECT_ID,
      chains: [mainnet, polygon, optimism, filecoin, arbitrum],
    })
  )
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        options={{
          initialChainId: 0,
        }}
      >
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  )
}
