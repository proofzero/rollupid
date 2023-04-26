import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = ({ request }) => {
  if (request.url.endsWith('/create')) {
    return redirect('/authenticate/passport')
  }
  return null
}
