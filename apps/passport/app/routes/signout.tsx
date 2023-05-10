import type { LoaderFunction } from '@remix-run/cloudflare'
import { destroyUserSession } from '~/session.server'

import { FLASH_MESSAGE } from '~/utils/flashMessage.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const redirectTo = params.get('redirect_uri') || '/'
  const clientId = params.get('client_id') ?? undefined

  return await destroyUserSession(
    request,
    redirectTo,
    context.env,
    FLASH_MESSAGE.SIGNOUT,
    clientId
  )
}
