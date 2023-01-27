import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { useOutletContext } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request }) => {
  return redirect('/auth')
}
