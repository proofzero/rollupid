import { getInvoices, getUpcomingInvoices } from '~/services/billing/stripe'
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
    // getting current invoices
    try {
      const currentInvoices = await getInvoices(
        {
          customerID: spd!.customerID,
        },
        SECRET_STRIPE_API_KEY
      )

      invoices = currentInvoices.data.map((i) => ({
        id: i.id,
        amount: i.total / 100,
        timestamp: i.created * 1000,
        status: i.status,
        url: i.hosted_invoice_url ?? undefined,
      }))
    } catch (er) {
      console.error(er)
    }
    // getting upcoming invoices
    try {
      const stripeUpcomingInvoices = await getUpcomingInvoices(
        {
          customerID: spd!.customerID,
        },
        SECRET_STRIPE_API_KEY
      )
      invoices = invoices.concat([
        {
          id: stripeUpcomingInvoices.lines.data[0].id,
          amount: stripeUpcomingInvoices.lines.data[0].amount / 100,
          timestamp: stripeUpcomingInvoices.lines.data[0].period.start * 1000,
          status: 'scheduled',
        },
      ])
    } catch (er) {
      console.error(er)
    }
  }
  return invoices
}
