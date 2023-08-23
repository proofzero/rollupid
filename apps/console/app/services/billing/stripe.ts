import { InternalServerError } from '@proofzero/errors'
import { type CoreClientType } from '@proofzero/platform-clients/core'
import { type ReconcileAppsSubscriptionsOutput } from '@proofzero/platform/starbase/src/jsonrpc/methods/reconcileAppSubscriptions'
import { ServicePlanType } from '@proofzero/types/billing'
import { BillingCustomerURN } from '@proofzero/urns/billing'
import { redirect } from '@remix-run/cloudflare'
import { type Env } from 'bindings'
import Stripe from 'stripe'
import plans from '~/routes/__layout/billing/plans'

type CreateCustomerParams = {
  email: string
  name: string
  URN: BillingCustomerURN
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
  URN: BillingCustomerURN
  handled?: boolean
}

type UpdateSubscriptionParams = {
  subscriptionID: string
  planID: string
  quantity: number
  handled?: boolean
}

type SubscriptionMetadata = Partial<{
  URN: BillingCustomerURN
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
    URN: BillingCustomerURN
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

  const planQuantities = subItems.data
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

  let reconciliations: ReconcileAppsSubscriptionsOutput = []
  for (const pq of planQuantities) {
    const planReconciliations =
      await coreClient.starbase.reconcileAppSubscriptions.mutate({
        URN: URN,
        count: pq.quantity!,
        plan: priceIdToPlanTypeDict[pq.priceID],
      })

    reconciliations = reconciliations.concat(planReconciliations)

    await coreClient.billing.updateEntitlements.mutate({
      URN: URN,
      subscriptionID: subscriptionID,
      quantity: pq.quantity!,
      type: priceIdToPlanTypeDict[pq.priceID],
    })
  }

  if (reconciliations.length > 0) {
    await Promise.all(
      reconciliations
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
      count: reconciliations.length,
      billingEmail,
      apps: reconciliations.map((app) => ({
        appName: app.appName,
        devEmail: app.devEmail,
        plan: app.plan,
      })),
      billingURL,
      settingsURL,
    })
  }
}
