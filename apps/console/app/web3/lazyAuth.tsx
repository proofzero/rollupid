import { getDefaultConfig, ConnectKitProvider } from 'connectkit'
import { Suspense } from 'react'
import { useHydrated } from 'remix-utils'
import { createConfig, WagmiConfig } from 'wagmi'

export function LazyAuth({
    autoConnect = false,
    children
}: {
    context?: any
    autoConnect?: boolean
    children: JSX.Element,
}) {
    const hydrated = useHydrated()
    if (!hydrated) return <>Loading...</>

    const config = createConfig(
        getDefaultConfig({
            appName: 'Rollup',
            autoConnect,
            walletConnectProjectId:
                window.ENV.WALLET_CONNECT_PROJECT_ID,
        })
    )
    return (
        <Suspense fallback="">
            <WagmiConfig config={config}>
                <ConnectKitProvider>
                    {children}
                </ConnectKitProvider>
            </WagmiConfig>
        </Suspense>
    )
}