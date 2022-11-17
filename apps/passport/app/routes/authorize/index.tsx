import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { createFetcherJsonRpcClient } from '@kubelt/platform.commons/src/jsonrpc'
import type { Func } from 'typed-json-rpc'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const app = url.searchParams.get('app')

  interface StarbaseApi {
    [key: string]: Func
    kb_initPlatform(): Promise<string[]>
  }
  const client = createFetcherJsonRpcClient<StarbaseApi>(Starbase)
  // TODO: fetch app profile using app id
  console.log('app', app)

  return json({ app })
}

export default function Authorize() {
  const { app } = useLoaderData()
  return <div>Authorize app: {app}</div>
}
