import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

import { requireJWT } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireJWT(request)
  return redirect('/account')
}
