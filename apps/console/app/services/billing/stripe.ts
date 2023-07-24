import { InternalServerError } from '@proofzero/errors'
import { ReconcileAppsSubscriptionsOutput } from '@proofzero/platform/starbase/src/jsonrpc/methods/reconcileAppSubscriptions'
import { ServicePlanType } from '@proofzero/types/account'
import { AccountURN } from '@proofzero/urns/account'
import { redirect } from '@remix-run/cloudflare'
import { Env } from 'bindings'
import Stripe from 'stripe'
import plans from '~/routes/__layout/billing/plans'

type CreateCustomerParams = {
  email: string
  name: string
  accountURN: string
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
  accountURN: AccountURN
  handled?: boolean
}

type UpdateSubscriptionParams = {
  subscriptionID: string
  planID: string
  quantity: number
  handled?: boolean
}

type SubscriptionMetadata = Partial<{
  accountURN: AccountURN
  handled: string | null
}>

type GetInvoicesParams = {
  customerID: string
}

export const createCustomer = async (
  { email, name, accountURN }: CreateCustomerParams,
  env: Env
) => {
  const stripeClient = new Stripe(env.SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const customer = await stripeClient.customers.create({
    email,
    name,
    metadata: {
      accountURN,
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
    accountURN,
    handled = false,
  }: CreateSubscriptionParams,
  SECRET_STRIPE_API_KEY: string
) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  const metadata: SubscriptionMetadata = {}
  metadata.accountURN = accountURN

  if (handled) metadata.handled = handled.toString()

  const subscription = await stripeClient.subscriptions.create({
    customer: customerID,
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
  {
    subscriptionID,
    planID,
    quantity,
    handled = false,
  }: UpdateSubscriptionParams,
  SECRET_STRIPE_API_KEY: string
) => {
  const stripeClient = new Stripe(SECRET_STRIPE_API_KEY, {
    apiVersion: '2022-11-15',
  })

  let metadata: SubscriptionMetadata = {}
  if (handled) metadata.handled = handled.toString()

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
    expand: ['latest_invoice.payment_intent'],
    metadata,
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
    expand: ['data.payment_intent'],
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
    accountURN,
    coreClient,
    billingURL,
    settingsURL,
  }: {
    subscriptionID: string
    accountURN: AccountURN
    coreClient: any
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
    await coreClient.account.getStripePaymentData.query({
      accountURN,
    })

  let reconciliations: ReconcileAppsSubscriptionsOutput = []
  for (const pq of planQuantities) {
    const planReconciliations =
      await coreClient.starbase.reconcileAppSubscriptions.mutate({
        accountURN: accountURN,
        count: pq.quantity,
        plan: priceIdToPlanTypeDict[pq.priceID],
      })

    reconciliations = reconciliations.concat(planReconciliations)

    await coreClient.account.updateEntitlements.mutate({
      accountURN: accountURN,
      subscriptionID: subscriptionID,
      quantity: pq.quantity,
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

    await coreClient.address.sendReconciliationNotification.query({
      planType: plans[reconciliations[0].plan].title, // Only pro for now
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
