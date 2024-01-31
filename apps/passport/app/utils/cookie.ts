import type { Request as CfRequest } from '@cloudflare/workers-types'

type CfHostMetadata = {
  clientId: string
}

export const getCookieDomain = (request: Request, env: Env): string => {
  const host = request.headers.get('host') as string
  if (env.DEFAULT_HOSTS.includes(host)) return env.COOKIE_DOMAIN
  const cfRequest = request as unknown as CfRequest<CfHostMetadata>
  const clientId = cfRequest.cf?.hostMetadata.clientId
  if (clientId) return host
  return env.COOKIE_DOMAIN
}
