import { ServicePlanType } from '@proofzero/types/account'
import { redirect } from '@remix-run/cloudflare'

type CheckoutParams = {
  planId: string
  planType: ServicePlanType
  quantity: number
  nonce: string
  customerID?: string
}

export const beginCheckout = (params: CheckoutParams): Response => {
  // TODO: Create Stripe Session
  // TODO: Append params to stripe session
  // TODO: Redirect to Stripe Checkout

  // This simulated a succesful Stripe checkout
  return redirect('/gnillib/checkout')
}
