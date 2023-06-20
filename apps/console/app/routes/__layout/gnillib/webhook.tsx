import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { AccountURN } from '@proofzero/urns/account'

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

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const obj = event.data.object as {
        customer: string
        metadata: Record<string, string>
      }

      const { nonce, accountURN } = obj.metadata as {
        nonce: string
        accountURN: AccountURN
      }

      await new Promise((ok) => setTimeout(ok, 5000))

      // await accountClient.fullfillServicePlanOrder.mutate({
      //   nonce,
      //   accountURN,
      // })
    }

    return null
  }
)
