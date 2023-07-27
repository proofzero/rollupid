import {
  createSubscription,
  getInvoices,
  getUpcomingInvoices,
  updateSubscription,
} from '~/services/billing/stripe'
import type { StripePaymentData } from '@proofzero/platform/account/src/types'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { type AccountURN } from '@proofzero/urns/account'
import { type PaymentIntent, loadStripe } from '@stripe/stripe-js'
import { type SubmitFunction } from '@remix-run/react'
import { type Session, type SessionData } from '@remix-run/cloudflare'
import { commitFlashSession } from '~/utilities/session.server'
import { type Env } from 'bindings'
import Stripe from 'stripe'

export type StripeInvoice = {
  id: string
  amount: number
  timestamp: number
  status: string | null
  url?: string
  payment_intent?: {
    id?: string
    status?: string
    client_secret?: string
    payment_method?: string
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
        amount: i.amount_due / 100,
        timestamp: i.created * 1000,
        status: i.status,
        url: i.hosted_invoice_url ?? undefined,
        payment_intent: i.payment_intent
          ? { id: (i.payment_intent as PaymentIntent).id }
          : undefined,
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

export const createOrUpdateSubscription = async ({
  subscriptionID,
  SECRET_STRIPE_PRO_PLAN_ID,
  SECRET_STRIPE_API_KEY,
  quantity,
  accountURN,
  customerID,
}: {
  subscriptionID?: string | null
  SECRET_STRIPE_PRO_PLAN_ID: string
  SECRET_STRIPE_API_KEY: string
  quantity: number
  accountURN: AccountURN
  customerID: string
}) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  let sub
  if (!subscriptionID) {
    sub = await createSubscription(
      {
        customerID: customerID,
        planID: SECRET_STRIPE_PRO_PLAN_ID,
        quantity,
        accountURN,
        handled: true,
      },
      stripeClient
    )
  } else {
    sub = await updateSubscription(
      {
        subscriptionID: subscriptionID,
        planID: SECRET_STRIPE_PRO_PLAN_ID,
        quantity,
        handled: true,
      },
      stripeClient
    )
  }

  return sub
}

export const process3DSecureCard = async ({
  STRIPE_PUBLISHABLE_KEY,
  status,
  client_secret,
  payment_method,
  submit,
  subId,
  redirectUrl,
}: {
  STRIPE_PUBLISHABLE_KEY: string
  status: string
  client_secret: string
  payment_method: string
  submit: SubmitFunction
  subId: string
  redirectUrl?: string
}) => {
  const stripeClient = await loadStripe(STRIPE_PUBLISHABLE_KEY)
  if (status === 'requires_action') {
    const result = await stripeClient?.confirmCardPayment(client_secret, {
      payment_method: payment_method,
    })

    if (result?.error || result?.paymentIntent.status !== 'succeeded') {
      toast(ToastType.Error, {
        message: 'Payment failed - check your card details',
      })
      return null
    }

    submit(
      {
        subId,
        redirectUrl: redirectUrl ? redirectUrl : '/billing',
      },
      {
        method: 'post',
        action: `/billing/update`,
      }
    )
  }
}

export const UnpaidInvoiceNotification = async ({
  invoices,
  flashSession,
  env,
}: {
  invoices: StripeInvoice[]
  flashSession: Session<SessionData, SessionData>
  env: Env
}) => {
  if (
    invoices.some(
      (invoice) =>
        invoice?.status && ['open', 'uncollectible'].includes(invoice.status)
    )
  ) {
    flashSession.flash(
      'toast_notification',
      JSON.stringify({
        type: ToastType.Error,
        message: 'Payment failed - check your card details',
      })
    )
    throw new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, env),
      },
    })
  }
}
