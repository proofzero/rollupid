import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { logout } from '~/session.server'

export const action: ActionFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const redirectTo = params.get('redirect_uri') || '/'

  return logout(request, redirectTo, context.env)
}

export const loader: LoaderFunction = async ({ request, context }) => {
  console.log('hello')
  const url = new URL(request.url)
  const params = new URLSearchParams(url.search)
  const redirectTo = params.get('redirect_uri') || '/'

  return logout(request, redirectTo, context.env)
}
