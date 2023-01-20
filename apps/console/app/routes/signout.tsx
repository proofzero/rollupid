import type { ActionFunction } from '@remix-run/cloudflare'
import { getUserSession, destroyUserSession } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request)
  return await destroyUserSession(session)
}
