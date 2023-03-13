import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { getProfileSession } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getProfileSession(request)
  const { user } = session.data

  const params = new URLSearchParams()
  if (!user) {
    params.append('prompt', 'select_account')
  }

  const redirectURI = `/auth?${params.toString()}`
  return redirect(redirectURI)
}
