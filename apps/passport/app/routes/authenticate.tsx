import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultClient } from 'connectkit'

import { getUserSession } from '~/session.server'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const jwt = await getUserSession(request)
  if (jwt) {
    const searchParams = new URL(request.url).searchParams
    return redirect(`/authorize?${searchParams}`)
  }
  return null
}

export default function Index() {
  // Setup client for connecting to wallets
  const client = createClient(
    getDefaultClient({
      appName: '3ID',
      alchemyId: ALCHEMY_KEY,
    })
  )
  return (
    <div className={'flex flex-col h-screen justify-center items-center'}>
      <WagmiConfig client={client}>
        <Outlet />
      </WagmiConfig>
    </div>
  )
}
