import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { getStabaseClient } from '~/starbase.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const app = url.searchParams.get('app')

  const sbClient = getStabaseClient()
  // TODO: fetch app profile using app id
  console.log('app', app)

  return json({ app })
}

export default function Authorize() {
  const { app } = useLoaderData()
  return <div>Authorize app: {app}</div>
}
