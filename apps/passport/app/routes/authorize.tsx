import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import type { Func } from 'typed-json-rpc'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import { Outlet } from '@remix-run/react'
import { requireJWT } from '~/session.server'

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
  interface StarbaseApi {
    [key: string]: Func
    kb_initPlatform(): Promise<string[]>
  }
  // const client = createFetcherJsonRpcClient<StarbaseApi>(Starbase)
  // const ids = await client.kb_initPlatform() // TODO: temporary until console is complete
  // console.log('ids', ids)
  // ======================= TEMPOARY =======================

  return null
}

export default function Authorize() {
  return (
    <div className={'flex flex-col h-screen justify-center items-center'}>
      <Outlet />
    </div>
  )
}
