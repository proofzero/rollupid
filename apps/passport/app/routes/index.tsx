import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async () => {
  return redirect(`/settings`)
}
