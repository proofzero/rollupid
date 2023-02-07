import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import createAccessClient from '@kubelt/platform-clients/access'
import { getAuthzTokenFromReq } from '@kubelt/utils'

export const loader: LoaderFunction = async ({ request, context }) => {
  const access_token = getAuthzTokenFromReq(request)
  if (!access_token) throw json({ message: 'No access token provided' }, 403)

  const accessClient = createAccessClient(context.env.Access)
  const result = accessClient.getUserInfo.query({ access_token })
  return result
}
