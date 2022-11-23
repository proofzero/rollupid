import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { requireJWT } from '~/session.server'
import { getStabaseClient } from '~/platform.server'
import gradientBG from '~/assets/gradient.jpg'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')

  // this will redirect unauthenticated users to the auth page but maintain query params
  await requireJWT(request)

  if (!client_id) {
    // Here we want to redirect the user to the error patch and allow
    // them to continue to the threeid app fit ehy are logged in
    throw json(
      { message: 'No app to authorize provided', isAuthenticated: true },
      400
    )
  }

  // ======================= TEMPOARY =======================
  const sbClient = getStabaseClient()
  console.log('init platform')
  try {
    const ids = await sbClient.kb_initPlatform() // TODO: temporary until console is complete
    console.log('ids', ids)
  } catch (e) {
    console.error(e)
  }
  // ======================= TEMPOARY =======================
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
