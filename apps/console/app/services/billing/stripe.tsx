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
  return redirect('/gnillib')
}

const handleCallback = (): Response => {
  return redirect('/gnillib')
}
