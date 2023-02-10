import type { ActionFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

export const action: ActionFunction = async ({ request }) => {
  return redirect(`${PASSPORT_URL}/signout`)
}
