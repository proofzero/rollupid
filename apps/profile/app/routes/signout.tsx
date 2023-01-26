import { ActionFunction } from '@remix-run/cloudflare'
import { initAuthenticator } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const authenticator = initAuthenticator()
  return await authenticator.logout(request, {
    redirectTo: 'https://threeid.xyz/profiles',
  })
}
