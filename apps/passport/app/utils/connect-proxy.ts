import { redirect } from '@remix-run/cloudflare'
import type { AppLoadContext } from '@remix-run/cloudflare'

import { getAuthnParams } from '~/auth.server'

export const setCustomDomainOrigin = (
  request: Request,
  context: AppLoadContext,
  authnParams: URLSearchParams
) => {
  const referer = request.headers.get('referer')
  if (!referer) return

  const { host, origin } = new URL(referer)
  if (context.env.DEFAULT_HOSTS.includes(host)) return

  authnParams.set('origin', origin)
}

export const redirectToDefaultHost = (
  request: Request,
  response: Response,
  context: AppLoadContext
) => {
  const url = new URL(request.url)
  if (context.env.DEFAULT_HOSTS.includes(url.host)) throw response

  url.host = context.env.DEFAULT_HOSTS[0]
  const { searchParams } = new URL(response.headers.get('location') as string)
  searchParams.forEach((value, key) => url.searchParams.set(key, value))
  throw redirect(url.toString(), {
    headers: {
      'set-cookie': response.headers.get('set-cookie') as string,
    },
  })
}

export const redirectToCustomDomainHost = async (
  request: Request,
  context: AppLoadContext
) => {
  const authnParams = await getAuthnParams(request, context.env)
  const origin = authnParams.get('origin')
  if (!origin) return

  const url = new URL(request.url)
  if (origin != url.origin) {
    const { pathname, searchParams } = url
    throw redirect(`${origin}${pathname}?${searchParams.toString()}`)
  }
}
