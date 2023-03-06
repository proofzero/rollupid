import { Outlet } from '@remix-run/react'
import { getDefaultClient } from 'connectkit'
import { Suspense, useEffect, useState } from 'react'
import { createClient, WagmiConfig } from 'wagmi'

export function LazyAuth({
  context,
  autoConnect = false,
}: {
  context?: any
  autoConnect?: boolean
}) {
  const [isFront, setIsFront] = useState(false)

  useEffect(() => {
    if (globalThis.window ?? false) {
      setIsFront(true)
    }
  }, [])

  if (!isFront) return null

  const client = createClient(
    getDefaultClient({
      appName: 'Rollup',
      autoConnect,
      alchemyId:
        typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
    })
  )
  return (
    <Suspense fallback={''}>
      <WagmiConfig client={client}>
        <Outlet context={context} />
      </WagmiConfig>
    </Suspense>
  )
}
