import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { IdentityURN } from '@proofzero/urns/identity'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { updatePaymentMethod } from '@proofzero/utils/billing/stripe'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const qp = new URL(request.url).searchParams
    const URN = qp.get('URN') as IdentityRefURN | undefined

    let targetURN = URN ?? identityURN
    if (IdentityGroupURNSpace.is(targetURN)) {
      const { read } =
        await coreClient.identity.hasIdentityGroupPermissions.query({
          identityURN,
          identityGroupURN: targetURN as IdentityGroupURN,
        })

      if (!read) {
        throw new UnauthorizedError({
          message: 'You are not authorized to read this identity group.',
        })
      }
    }

    const { customerID } = await coreClient.billing.getStripePaymentData.query({
      URN: targetURN,
    })

    const headers = request.headers
    let returnURL = headers.get('Referer')
    if (!returnURL) {
      throw new BadRequestError({
        message: 'No Referer found in request.',
      })
    }

    return updatePaymentMethod(
      {
        customerID,
        returnURL,
      },
      context.env.SECRET_STRIPE_API_KEY
    )
  }
)
