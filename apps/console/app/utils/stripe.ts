import {
  createSubscription,
  getInvoices,
  getUpcomingInvoices,
  updateSubscription,
} from '~/services/billing/stripe'
import type { StripePaymentData } from '@proofzero/platform/account/src/types'
import type Stripe from 'stripe'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { type AccountURN } from '@proofzero/urns/account'
import { loadStripe } from '@stripe/stripe-js'
import { type SubmitFunction } from '@remix-run/react'

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
      SECRET_STRIPE_API_KEY
    )
  } else {
    sub = await updateSubscription(
      {
        subscriptionID: subscriptionID,
        planID: SECRET_STRIPE_PRO_PLAN_ID,
        quantity,
        handled: true,
      },
      SECRET_STRIPE_API_KEY
    )
  }
  return sub
}

export const setPurchaseToastNotification = ({
  sub,
  flashSession,
}: {
  sub: Stripe.Subscription
  flashSession: any
}) => {
  // https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses
  if (sub.status === 'active' || sub.status === 'trialing') {
    flashSession.flash(
      'toast_notification',
      JSON.stringify({
        type: ToastType.Success,
        message: 'Entitlement(s) successfully bought',
      })
    )
  } else {
    if (
      (sub.latest_invoice as unknown as StripeInvoice)?.payment_intent
        ?.status === 'requires_action'
    ) {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Warning,
          message: 'Payment requires additional action',
        })
      )
    } else {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Error,
          message: 'Payment failed - check your card details',
        })
      )
    }
  }
}

export const process3DSecureCard = async ({
  STRIPE_PUBLISHABLE_KEY,
  status,
  client_secret,
  payment_method,
  submit,
  subId,
}: {
  STRIPE_PUBLISHABLE_KEY: string
  status: string
  client_secret: string
  payment_method: string
  submit?: SubmitFunction
  subId?: string
}) => {
  const stripeClient = await loadStripe(STRIPE_PUBLISHABLE_KEY)
  if (status === 'requires_action') {
    const result = await stripeClient?.confirmCardPayment(client_secret, {
      payment_method: payment_method,
    })

    if (result?.error) {
      toast(ToastType.Error, {
        message: 'Something went wrong. Please try again',
      })
      return null
    }

    if (subId && submit) {
      submit(
        { subId },
        {
          method: 'post',
          action: `/billing/update`,
        }
      )
    } else {
      toast(ToastType.Success, {
        message: 'Successfully purchased entitlement(s)',
      })
    }
  }
}
