import type { LoaderFunction } from '@remix-run/cloudflare'
import { createUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const searchParams = new URL(request.url).searchParams

  // TODO exchange token for access token

  const redirectURL = searchParams.get('client_id')
    ? `/authorize?${searchParams}`
    : THREEID_APP_URL

  return createUserSession('', redirectURL)
}
