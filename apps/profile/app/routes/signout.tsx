import type { ActionFunction } from '@remix-run/cloudflare'
import { initAuthenticator } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url)
  const params = new URLSearchParams({
    redirect_uri: `${url.protocol}//${url.host}/auth`,
  })
  const authenticator = initAuthenticator()
  return authenticator.logout(request, {
    redirectTo: `${PASSPORT_URL}/signout?${params}`,
  })
}
