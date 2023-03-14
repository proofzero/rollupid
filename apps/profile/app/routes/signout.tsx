import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { initAuthenticator } from '~/utils/session.server'

const signOut = (request: Request) => {
  const authenticator = initAuthenticator()
  return authenticator.logout(request, {
    redirectTo: `/auth`,
  })
}

export const loader: LoaderFunction = async ({ request }) => {
  return signOut(request)
}

export const action: ActionFunction = async ({ request }) => {
  return signOut(request)
}
