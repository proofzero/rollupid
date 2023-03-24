import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async ({ params }) => {
  if (!params.clientId) {
    return redirect(`/authenticate/console`)
  }
  return redirect(`/authenticate`)
}
