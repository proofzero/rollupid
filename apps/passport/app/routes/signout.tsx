import type { LoaderFunction } from '@remix-run/cloudflare'
import { logout } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const redirectTo = params.get('redirect_uri') || '/'
  return logout(request, redirectTo, context.env)
}
