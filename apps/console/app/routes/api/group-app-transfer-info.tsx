import { type ActionFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createCoreClient from '@proofzero/platform-clients/core'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { getEmailDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { GetEntitlementsOutput } from '@proofzero/platform/billing/src/jsonrpc/methods/getEntitlements'

export type GroupAppTransferInfo = {
  connectedEmails: DropdownSelectListItem[]
  hasPaymentMethod: boolean
  entitlements: GetEntitlementsOutput
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const URN = fd.get('URN') as IdentityRefURN | null
    if (!URN) {
      throw new BadRequestError({
        message: 'URN is required',
      })
    }

    const [spd, entitlements, connectedAccounts] = await Promise.all([
      await coreClient.billing.getStripePaymentData.query({
        URN,
      }),
      await coreClient.billing.getEntitlements.query({
        URN,
      }),
      await coreClient.identity.getAccounts.query({
        URN,
      }),
    ])

    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    return json<GroupAppTransferInfo>({
      connectedEmails,
      hasPaymentMethod: spd && spd.paymentMethodID ? true : false,
      entitlements,
    })
  }
)
