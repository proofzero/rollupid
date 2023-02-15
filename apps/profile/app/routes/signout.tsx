import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { initAuthenticator } from '~/utils/session.server'

const signOut = (request: Request) => {
  const url = new URL(request.url)
  const params = new URLSearchParams({
    redirect_uri: `${url.protocol}//${url.host}/auth`,
  })
  const authenticator = initAuthenticator()
  return authenticator.logout(request, {
    redirectTo: `${PASSPORT_URL}/signout?${params}`,
  })
}

export const loader: LoaderFunction = async ({ request }) => {
  return signOut(request)
}

export const action: ActionFunction = async ({ request }) => {
  return signOut(request)
}
