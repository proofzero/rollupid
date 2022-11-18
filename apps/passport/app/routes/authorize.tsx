import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'
import { requireJWT } from '~/session.server'
import { getStabaseClient } from '~/starbase.server'

// TODO: loader function check if we have a session already
// redirect if logged in
export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const app = url.searchParams.get('app')

  // this will redirect unauthenticated users to the auth page but maintain query params
  await requireJWT(request)

  if (!app) {
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
    if (!ids.keys.length) {
      console.error('No apps initialized')
      throw json({ message: 'No apps initialized' }, 400)
    }
    return null
  } catch (e) {
    console.error(e)
    throw json({ message: 'Failed to init starbase' }, 500)
  }
  // ======================= TEMPOARY =======================
}

export default function Authorize() {
  return (
    <div className={'flex flex-col h-screen justify-center items-center'}>
      <Outlet />
    </div>
  )
}
