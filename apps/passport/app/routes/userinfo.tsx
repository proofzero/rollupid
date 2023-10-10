import type { LoaderFunction } from '@remix-run/cloudflare'
import { getAuthzTokenFromReq } from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { UnauthorizedError } from '@proofzero/errors'

import { getCoreClient } from '../platform.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const access_token = getAuthzTokenFromReq(request)
    if (!access_token)
      throw new UnauthorizedError({ message: 'No access token provided' })

    const { origin: issuer } = new URL(request.url)

    const coreClient = getCoreClient({ context })
    return coreClient.authorization.getUserInfo.query({
      access_token,
      issuer,
    })
  }
)
