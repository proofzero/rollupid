import { JsonError } from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

import { getAccessClient } from '~/platform.server'

export const loader: LoaderFunction = async ({ context }) => {
  const client = getAccessClient(context.env, context.traceSpan)
  try {
    const jwks = await client.getJWKS.query()
    return json(jwks)
  } catch (error) {
    throw JsonError(error)
  }
}
