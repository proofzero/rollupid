import {
  JsonError,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

import { getAccessClient } from '~/platform.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ context }) => {
    const client = getAccessClient(context.env, context.traceSpan)
    const jwks = await client.getJWKS.query()
    return json(jwks)
  }
)
