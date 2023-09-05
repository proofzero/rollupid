import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { IdentityURN } from '@proofzero/urns/identity'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const sp = new URL(request.url).searchParams
    const spURN = sp.get('URN')

    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const targetURN = spURN ?? identityURN

    const entitlements = await coreClient.billing.getEntitlements.query({
      URN: targetURN as IdentityRefURN,
    })

    return json({
      entitlements,
    })
  }
)
