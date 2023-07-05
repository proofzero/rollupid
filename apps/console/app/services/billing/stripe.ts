import { InternalServerError } from '@proofzero/errors'
import { AccountURN } from '@proofzero/urns/account'
import { redirect } from '@remix-run/cloudflare'
import Stripe from 'stripe'

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

export const createCustomer = async ({
  email,
  name,
  accountURN,
}: CreateCustomerParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
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

export const updateCustomer = async ({
  customerID,
  email,
  name,
}: UpdateCustomerParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  const customer = await stripeClient.customers.update(customerID, {
    email,
    name,
  })

  return customer
}

export const accessCustomerPortal = async ({
  customerID,
  returnURL,
}: CustomerPortalParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerID,
    return_url: returnURL,
  })

  return redirect(session.url)
}

export const updatePaymentMethod = async ({
  customerID,
  returnURL,
}: CustomerPortalParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
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

export const createSubscription = async ({
  customerID,
  planID,
  quantity,
  accountURN,
  handled = false,
}: CreateSubscriptionParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
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
    metadata,
  })

  return subscription
}

export const updateSubscription = async ({
  subscriptionID,
  planID,
  quantity,
  handled = false,
}: UpdateSubscriptionParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
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
    metadata,
  })

  return subscription
}

export const updateSubscriptionMetadata = async ({
  id,
  metadata,
}: {
  id: string
  metadata: SubscriptionMetadata
}) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
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

export const getInvoices = async ({ customerID }: GetInvoicesParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  const invoices = await stripeClient.invoices.list({
    customer: customerID,
  })

  const upcomingInvoices = await stripeClient.invoices.retrieveUpcoming({
    customer: customerID,
  })

  return {
    invoices,
    upcomingInvoices,
  }
}
