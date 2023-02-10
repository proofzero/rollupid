import type { LoaderFunction } from '@remix-run/cloudflare'
import { logout } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  return logout(request, context.env)
}
