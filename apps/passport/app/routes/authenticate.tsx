import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { useState, Suspense, lazy } from 'react'

import { getUserSession } from '~/session.server'
// import { getDefaultClient } from 'connectkit'
// import { WagmiConfig, createClient } from 'wagmi'
import React from 'react'

// import WagmiConfig from '~/web3/WagmiConfig.client'
// import createClient from '~/web3/createClient.client'
// import getDefaultClient from '~/web3/getDefaultClient.client'

// const { WagmiConfig } = lazy(() => import('wagmi'))
// const createClient = lazy(() => import('~/web3/createClient.client'))
// const getDefaultClient = lazy(() => import('~/web3/getDefaultClient.client'))

// async function getConnectKit() {
//   let _connectKit: any
//   if (!_connectKit) {
//     _connectKit = await import('connectkit')
//   }
//   return _connectKit
// }
// async function getWagmiKit() {
//   let _wagmi: any
//   if (!_wagmi) {
//     _wagmi = await import('wagmi')
//   }
//   return _wagmi
// }

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
let LazyAuth = React.lazy(() =>
  import('~/web3/laxyAuth').then((module) => ({ default: module.LazyAuth }))
)

export default function Index() {
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
        <Suspense fallback={/*Show some spinner*/ ''}>
          <LazyAuth />
        </Suspense>
      </div>
    </div>
  )
}
