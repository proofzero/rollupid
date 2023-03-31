import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async ({ request, params }) => {
  const qp = new URLSearchParams()

  const url = new URL(request.url)
  const { protocol, host } = url

  qp.append('client_id', 'passport')
  qp.append('redirect_uri', `${protocol}//${host}/settings`)
  qp.append('state', 'skip')
  qp.append('scope', '')

  return redirect(`/authorize?${qp.toString()}`)
}
