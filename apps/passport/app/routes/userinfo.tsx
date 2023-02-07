import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/session.server'
import createAccessClient from '@kubelt/platform-clients/access'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

export const loader: LoaderFunction = async ({ request, context }) => {
  const access_token = request.headers.get(PlatformJWTAssertionHeader)
  if (!access_token) throw json({ message: 'No access token provided' }, 403)

  const accessClient = createAccessClient(context.env.Access)
  const result = accessClient.getUserInfo.query({ access_token })
  return result
}
