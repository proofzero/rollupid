import type { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { requireJWT } from '~/session.server'
import gradientBG from '~/assets/gradient.jpg'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  // this will redirect unauthenticated users to the auth page but maintain query params
  await requireJWT(request)

  return null
}

export default function Authorize() {
  return (
    <div className={'flex flex-row h-screen justify-center items-center'}>
      <div
        style={{
          backgroundImage: `url(${gradientBG})`,
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
