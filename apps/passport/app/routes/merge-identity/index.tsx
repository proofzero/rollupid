import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = () => {
  return redirect('/merge-identity/prompt')
}
