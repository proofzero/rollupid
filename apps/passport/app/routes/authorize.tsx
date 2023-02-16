import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Outlet, useLoaderData } from '@remix-run/react'
import { getAccountClient } from '~/platform.server'
import { parseJwt, requireJWT } from '~/session.server'
import { AccountURN } from '@kubelt/urns/account'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  // this will redirect unauthenticated users to the auth page but maintain query params
  const jwt = await requireJWT(request, context.consoleParams, context.env)
  const account = parseJwt(jwt).sub as AccountURN
  const accountClient = getAccountClient(jwt, context.env)
  const profile = await accountClient.getProfile.query({ account })

  return json({ profile })
}

export default function Authorize() {
  const { profile } = useLoaderData()
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
        <Outlet context={{ profile }} />
      </div>
    </div>
  )
}
