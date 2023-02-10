import type { ActionFunction } from '@remix-run/cloudflare'
import { logout } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  return await logout(request)
}
