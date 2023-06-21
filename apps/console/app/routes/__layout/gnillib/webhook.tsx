import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { AccountURN } from '@proofzero/urns/account'
import { ServicePlanType } from '@proofzero/types/account'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const stripeClient = new Stripe(STRIPE_API_SECRET, {
      apiVersion: '2022-11-15',
    })

    const whSecret = STRIPE_WEBHOOK_SECRET

    const payload = await request.text()
    const sig = request.headers.get('stripe-signature') as string

    const event = await stripeClient.webhooks.constructEventAsync(
      payload,
      sig,
      whSecret
    )

    if (event.type === 'customer.subscription.updated') {
      const { id, quantity, metadata } = event.data.object as {
        id: string
        quantity: number
        metadata: Record<string, string>
      }

      const { accountURN } = metadata as {
        accountURN: AccountURN
      }

      await accountClient.updateEntitlements.mutate({
        accountURN,
        subscriptionID: id,
        quantity,
        type: ServicePlanType.PRO,
      })
    }

    return null
  }
)
