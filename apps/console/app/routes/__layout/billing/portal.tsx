import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { accessCustomerPortal } from '~/services/billing/stripe'
import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { AnyURN } from '@proofzero/urns'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { IdentityURN } from '@proofzero/urns/identity'

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
    const URN = qp.get('URN') as AnyURN | undefined

    let targetURN = URN ?? identityURN
    if (IdentityGroupURNSpace.is(targetURN)) {
      const authorized =
        await coreClient.identity.hasIdentityGroupAuthorization.query({
          identityURN,
          identityGroupURN: targetURN as IdentityGroupURN,
        })

      if (!authorized) {
        throw new UnauthorizedError({
          message: 'You are not authorized to update this identity group.',
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

    return accessCustomerPortal(
      {
        customerID,
        returnURL,
      },
      context.env
    )
  }
)
