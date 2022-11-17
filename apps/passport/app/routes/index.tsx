import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async ({ request, context }) => {
  const searchParams = new URL(request.url).searchParams
  return redirect(`/authenticate?${searchParams}`)
}
