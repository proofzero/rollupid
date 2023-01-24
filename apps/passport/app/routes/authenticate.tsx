import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultClient } from 'connectkit'

import { getUserSession } from '~/session.server'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const session = await getUserSession(request, false, context.env)
  const searchParams = new URL(request.url).searchParams

  if (session.get('jwt') && searchParams.get('client_id')) {
    const searchParams = new URL(request.url).searchParams
    return redirect(`/authorize?${searchParams}`)
  }
  if (session.get('jwt')) {
    return redirect(context.env.CONSOLE_APP_URL)
  }
  return null
}

export default function Index() {
  // Setup client for connecting to wallets
  const client = createClient(
    getDefaultClient({
      appName: '3ID',
      alchemyId:
        typeof window !== 'undefined' && window.ENV.APIKEY_ALCHEMY_PUBLIC,
    })
  )
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        style={{
          backgroundImage: `url(https://imagedelivery.net/VqQy1abBMHYDZwVsTbsSMw/918fa1e6-d9c2-40d3-15cf-63131a2d8400/public)`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        className={'basis-2/5 h-screen w-full hidden lg:block'}
      ></div>
      <div className={'basis-full basis-full lg:basis-3/5'}>
        <WagmiConfig client={client}>
          <Outlet />
        </WagmiConfig>
      </div>
    </div>
  )
}
