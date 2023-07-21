import { getInvoices } from '~/services/billing/stripe'
import type { StripePaymentData } from '@proofzero/platform/account/src/types'

export type StripeInvoice = {
  id: string
  amount: number
  timestamp: number
  status: string | null
  url?: string
  payment_intent?: {
    status: string
    client_secret: string
    payment_method: string
  }
}

export const getCurrentAndUpcomingInvoices = async (
  spd: StripePaymentData,
  SECRET_STRIPE_API_KEY: string
) => {
  let invoices = [] as StripeInvoice[]

  if (spd?.customerID) {
    try {
      const stripeInvoices = await getInvoices(
        {
          customerID: spd!.customerID,
        },
        SECRET_STRIPE_API_KEY
      )

      invoices = stripeInvoices.invoices.data.map((i) => ({
        id: i.id,
        amount: i.total / 100,
        timestamp: i.created * 1000,
        status: i.status,
        url: i.hosted_invoice_url ?? undefined,
      }))

      if (stripeInvoices.upcomingInvoices) {
        invoices = invoices.concat([
          {
            id: stripeInvoices.upcomingInvoices.lines.data[0].id,
            amount: stripeInvoices.upcomingInvoices.lines.data[0].amount / 100,
            timestamp:
              stripeInvoices.upcomingInvoices.lines.data[0].period.start * 1000,
            status: 'scheduled',
          },
        ])
      }
    } catch (er) {
      console.error(er)
    }
  }
  return invoices
}
