import { InternalServerError } from '@proofzero/errors'
import { type CoreClientType } from '@proofzero/platform-clients/core'
import { type ReconcileAppsSubscriptionsOutput } from '@proofzero/platform/starbase/src/jsonrpc/methods/reconcileAppSubscriptions'
import { ServicePlanType } from '@proofzero/types/billing'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { redirect } from '@remix-run/cloudflare'
import { type Env } from 'bindings'
import Stripe from 'stripe'
import plans from '~/utils/plans'

type CreateCustomerParams = {
  email: string
  name: string
  URN: IdentityRefURN
}

type UpdateCustomerParams = {
  customerID: string
  email: string
  name: string
}

type CustomerPortalParams = {
  customerID: string
  returnURL: string
}

type CreateSubscriptionParams = {
  customerID: string
  planID: string
  quantity: number
  URN: IdentityRefURN
  handled?: boolean
}

type UpdateSubscriptionParams = {
  subscriptionID: string
  planID: string
  quantity: number
  handled?: boolean
}

type SubscriptionMetadata = Partial<{
  URN: IdentityRefURN
  handled: string | null
}>

type GetInvoicesParams = {
  customerID: string
}

export const createCustomer = async (
  { email, name, URN }: CreateCustomerParams,
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const customer = await stripeClient.customers.create({
    email,
    name,
    metadata: {
      URN,
    },
  })

  return customer
}

export const updateCustomer = async (
  { customerID, email, name }: UpdateCustomerParams,
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const customer = await stripeClient.customers.update(customerID, {
    email,
    name,
  })

  return customer
}

export const accessCustomerPortal = async (
  { customerID, returnURL }: CustomerPortalParams,
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerID,
    return_url: returnURL,
  })

  return redirect(session.url)
}

export const updatePaymentMethod = async (
  { customerID, returnURL }: CustomerPortalParams,
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerID,
    return_url: returnURL,
    flow_data: {
      type: 'payment_method_update',
    },
  })

  return redirect(session.url)
}

export const createSubscription = async (
  {
    customerID,
    planID,
    quantity,
    URN,
    handled = false,
  }: CreateSubscriptionParams,
  stripeClient: Stripe
) => {
  const metadata: SubscriptionMetadata = {}
  metadata.URN = URN

  if (handled) metadata.handled = handled.toString()

  const subscription = await stripeClient.subscriptions.create({
    customer: customerID as string,
    items: [
      {
        price: planID,
        quantity,
      },
    ],
    expand: ['latest_invoice.payment_intent'],
    metadata,
  })

  return subscription
}

export const updateSubscription = async (
  { subscriptionID, planID, quantity }: UpdateSubscriptionParams,
  stripeClient: Stripe
) => {
  let subscription = await stripeClient.subscriptions.retrieve(subscriptionID)
  const planItem = subscription.items.data.find((i) => i.price.id === planID)
  if (!planItem)
    throw new InternalServerError({
      message: 'Plan not found',
    })

  subscription = await stripeClient.subscriptions.update(subscription.id, {
    proration_behavior: 'always_invoice',
    items: [
      {
        id: planItem.id,
        quantity,
      },
    ],
    payment_behavior: 'pending_if_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })

  return subscription
}

export const updateSubscriptionMetadata = async (
  {
    id,
    metadata,
  }: {
    id: string
    metadata: SubscriptionMetadata
  },
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const subscription = await stripeClient.subscriptions.retrieve(id)
  const updatedSubscription = await stripeClient.subscriptions.update(
    subscription.id,
    {
      metadata,
    }
  )

  return updatedSubscription
}

export const getInvoices = async (
  { customerID }: GetInvoicesParams,
  SECRET_STRIPE_API_KEY: string
) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const invoices = await stripeClient.invoices.list({
    customer: customerID,
    expand: ['data.payment_intent'],
  })

  return invoices
}

export const getUpcomingInvoices = async (
  { customerID }: GetInvoicesParams,
  SECRET_STRIPE_API_KEY: string
) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const upcomingInvoices = await stripeClient.invoices.retrieveUpcoming({
    customer: customerID,
  })
  return upcomingInvoices
}

export const voidInvoice = async (
  invoiceId: string,
  SECRET_STRIPE_API_KEY: string
) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  await stripeClient.invoices.voidInvoice(invoiceId)
}

export const reconcileAppSubscriptions = async (
  {
    subscriptionID,
    URN,
    coreClient,
    billingURL,
    settingsURL,
  }: {
    subscriptionID: string
    URN: IdentityRefURN
    coreClient: CoreClientType
    billingURL: string
    settingsURL: string
  },
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const subItems = await stripeClient.subscriptionItems.list({
    subscription: subscriptionID,
  })

  const mappedSubItems = subItems.data
    .map((si) => ({
      priceID: si.price.id,
      quantity: si.quantity,
    }))
    .filter((pq) => pq.quantity != null)

  const priceIdToPlanTypeDict = {
    [env.SECRET_STRIPE_PRO_PLAN_ID]: ServicePlanType.PRO,
  }

  const { email: billingEmail } =
    await coreClient.billing.getStripePaymentData.query({
      URN,
    })

  const planQuantities = mappedSubItems.filter((msu) =>
    Boolean(priceIdToPlanTypeDict[msu.priceID])
  )

  let reconciledPlans: ReconcileAppsSubscriptionsOutput = []
  for (const pq of planQuantities) {
    const planReconciliations =
      await coreClient.starbase.reconcileAppSubscriptions.mutate({
        URN: URN,
        count: pq.quantity!,
        plan: priceIdToPlanTypeDict[pq.priceID],
      })

    reconciledPlans = reconciledPlans.concat(planReconciliations)

    await coreClient.billing.updateEntitlements.mutate({
      URN: URN,
      subscriptionID: subscriptionID,
      quantity: pq.quantity!,
      type: priceIdToPlanTypeDict[pq.priceID],
    })
  }

  if (reconciledPlans.length > 0) {
    await Promise.all(
      reconciledPlans
        .filter((r) => r.customDomain)
        .map(async (app) => {
          try {
            await coreClient.starbase.deleteCustomDomain.mutate({
              clientId: app.clientID,
            })
          } catch (e) {
            console.error(
              `Failed to delete custom domain for app ${app.clientID}`
            )
          }
        })
    )

    await coreClient.account.sendReconciliationNotification.query({
      planType: plans[ServicePlanType.PRO].title, // Only pro for now
      count: reconciledPlans.length,
      billingEmail,
      apps: reconciledPlans.map((app) => ({
        appName: app.appName,
        devEmail: app.devEmail,
        plan: app.plan,
      })),
      billingURL,
      settingsURL,
    })
  }

  if (IdentityGroupURNSpace.is(URN)) {
    const seatQuantities = mappedSubItems.find(
      (msu) => msu.priceID === env.SECRET_STRIPE_GROUP_SEAT_PLAN_ID
    )

    if (seatQuantities) {
      const { quantity: stripeSeatQuantity } = seatQuantities
      const groupSeats = await coreClient.billing.getIdentityGroupSeats.query({
        URN: URN as IdentityGroupURN,
      })

      if (!groupSeats || groupSeats.quantity !== stripeSeatQuantity!) {
        await coreClient.billing.updateIdentityGroupSeats.mutate({
          URN: URN as IdentityGroupURN,
          subscriptionID: subscriptionID,
          quantity: stripeSeatQuantity!,
        })
      }
    }
  }
}
