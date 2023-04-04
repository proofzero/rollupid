import type { ActionFunction } from '@remix-run/cloudflare'
import { destroyUserSession } from '~/utilities/session.server'

export const action: ActionFunction = async ({ request }) => {
  const consoleUrl = new URL(request.url)
  const { protocol, host } = consoleUrl

  const url = new URL(`${PASSPORT_URL}/authorize`)
  url.searchParams.append('client_id', 'console')
  url.searchParams.append('redirect_uri', `${protocol}//${host}`)
  url.searchParams.append('state', 'skip')
  url.searchParams.append('scope', '')

  return destroyUserSession(request, url.toString())
}
