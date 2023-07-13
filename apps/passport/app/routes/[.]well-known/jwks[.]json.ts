import {
  JsonError,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

import { getCoreClient } from '~/platform.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ context }) => {
    const client = getCoreClient({ context })
    const jwks = await client.access.getJWKS.query()
    return json(jwks)
  }
)
