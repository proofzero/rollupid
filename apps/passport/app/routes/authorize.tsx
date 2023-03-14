import { Profile } from '@kubelt/platform/account/src/types'
import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import { Outlet, useOutletContext } from '@remix-run/react'
import { createConsoleParamsSession, requireJWT } from '~/session.server'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const params = new URL(request.url).searchParams
  const prompt = params.get('prompt')

  if (prompt !== 'none') {
    if (context.consoleParams.clientId)
      throw await createConsoleParamsSession(context.consoleParams, context.env)
    else throw redirect('/authenticate')
  }

  // this will redirect unauthenticated users to the auth page but maintain query params
  await requireJWT(request, context.consoleParams, context.env)

  return null
}

export default function Authorize() {
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
        <Outlet />
      </div>
    </div>
  )
}
