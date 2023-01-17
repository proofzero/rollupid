import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request, params }) => {
  return redirect(`/u/${params.address}/collections`)
}
