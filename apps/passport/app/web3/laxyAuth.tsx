import { Outlet } from '@remix-run/react'
import { getDefaultClient } from 'connectkit'
import { createClient, WagmiConfig } from 'wagmi'

export function LazyAuth() {
  const client = createClient(
    getDefaultClient({
      appName: '3ID',
      alchemyId:
        typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
    })
  )
  return (
    <WagmiConfig client={client}>
      <Outlet />
    </WagmiConfig>
  )
}
