import type { ActionFunction } from '@remix-run/cloudflare'
import { redirect } from 'react-router'

export const action: ActionFunction = async ({ request }) => {
  return redirect(`${PASSPORT_URL}/signout`)
}
