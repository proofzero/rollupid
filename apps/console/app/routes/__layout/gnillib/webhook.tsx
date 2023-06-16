import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const apiKey = STRIPE_API_SECRET
    const stripeClient = new Stripe(apiKey, {
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
      const { nonce } = (
        event.data.object as {
          metadata: Record<string, string>
        }
      ).metadata as {
        nonce: string
      }

      console.log({
        nonce,
      })
    }

    return null
  }
)
