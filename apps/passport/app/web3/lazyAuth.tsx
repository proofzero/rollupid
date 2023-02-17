import { Outlet } from '@remix-run/react'
import { getDefaultClient } from 'connectkit'
import { createClient, WagmiConfig } from 'wagmi'

export function LazyAuth({ context }: { context?: any }) {
  const client = createClient(
    getDefaultClient({
      appName: 'Rollup',
      alchemyId:
        typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
    })
  )
  return (
    <WagmiConfig client={client}>
      <Outlet context={context} />
    </WagmiConfig>
  )
}
