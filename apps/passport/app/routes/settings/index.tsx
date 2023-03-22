import { redirect } from '@remix-run/cloudflare'

export const loader = async () => {
  return redirect('/settings/dashboard')
}
