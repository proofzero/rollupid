import type { LoaderFunction } from '@remix-run/cloudflare'
import createAccessClient from '@proofzero/platform-clients/access'
import { getAuthzTokenFromReq } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { UnauthorizedError } from '@proofzero/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const access_token = getAuthzTokenFromReq(request)
    if (!access_token)
      throw new UnauthorizedError({ message: 'No access token provided' })

    const { origin: issuer } = new URL(request.url)

    const accessClient = createAccessClient(context.env.Access, {
      ...generateTraceContextHeaders(context.traceSpan),
    })
    const result = await accessClient.getUserInfo.query({
      access_token,
      issuer,
    })
    return result
  }
)
