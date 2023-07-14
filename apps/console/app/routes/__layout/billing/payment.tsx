import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { updatePaymentMethod } from '~/services/billing/stripe'
import { AccountURN } from '@proofzero/urns/account'
import { BadRequestError } from '@proofzero/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(context.env.Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { customerID } = await accountClient.getStripePaymentData.query({
      accountURN,
    })

    const headers = request.headers
    let returnURL = headers.get('Referer')
    if (!returnURL) {
      throw new BadRequestError({
        message: 'No Referer found in request.',
      })
    }

    return updatePaymentMethod({
      customerID,
      returnURL,
    }, context.env)
  }
)
