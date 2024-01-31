import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type LoaderFunction, redirect } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groups = await coreClient.identity.listIdentityGroups.query()
    if (groups.length > 0) {
      return redirect('/billing/spuorg')
    }

    return redirect('/billing/personal')
  }
)
