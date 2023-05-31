import { Outlet } from '@remix-run/react'
import { getDefaultConfig, ConnectKitProvider } from 'connectkit'
import { Suspense, useEffect, useState } from 'react'
import { useHydrated } from 'remix-utils'
import { createConfig, WagmiConfig } from 'wagmi'

export function LazyAuth({
    context,
    autoConnect = false,
    children
}: {
    context?: any
    autoConnect?: boolean
    children: JSX.Element,
}) {
    const hydrated = useHydrated()
    if (!hydrated) return <>Loading...</>

    const client = createConfig(
        getDefaultConfig({
            appName: 'Rollup',
            autoConnect,
            alchemyId:
                typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
            walletConnectProjectId:
                typeof window !== 'undefined' && window.ENV.WALLET_CONNECT_PROJECT_ID,
        })
    )
    return (
        <Suspense fallback={''}>
            <WagmiConfig config={client}>
                <ConnectKitProvider>
                    {children}
                </ConnectKitProvider>
            </WagmiConfig>

        </Suspense >
    )
}