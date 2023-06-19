import { InternalServerError } from '@proofzero/errors'
import { ServicePlanType } from '@proofzero/types/account'
import { AccountURN } from '@proofzero/urns/account'
import { redirect } from '@remix-run/cloudflare'
import Stripe from 'stripe'

type CheckoutParams = {
  planId: string
  planType: ServicePlanType
  quantity: number
  nonce: string
  customerID?: string
  accountURN: AccountURN
}

export const beginCheckout = async (
  params: CheckoutParams
): Promise<Response> => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  // TODO: Create Stripe Session
  const session = await stripeClient.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1NJaDgFEfyl69U7XQBHZDiDM',
        quantity: params.quantity,
      },
    ],
    mode: 'subscription',
    success_url: `http://localhost:10002/gnillib/checkout?status=success`,
    cancel_url: `http://localhost:10002/gnillib/checkout?status=canceled`,
    metadata: {
      nonce: params.nonce,
      accountURN: params.accountURN,
    },
    customer: params.customerID,
  })

  // TODO: Redirect to Stripe Checkout
  if (!session.url)
    throw new InternalServerError({
      message: 'Stripe session url is undefined',
    })

  return redirect(session.url)
}
