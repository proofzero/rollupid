import { InternalServerError } from '@proofzero/errors'
import { ServicePlanType } from '@proofzero/types/account'
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

type UpdatePaymentMethodParams = {
  customerID: string
}

type CreateSubscriptionParams = {
  customerID: string
  planID: string
  quantity: number
  accountURN: AccountURN
}

type UpdateSubscriptionParams = {
  subscriptionID: string
  planID: string
  quantity: number
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

export const updatePaymentMethod = async ({
  customerID,
}: UpdatePaymentMethodParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerID,
    return_url: 'http://localhost:10002/gnillib',
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
}: CreateSubscriptionParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

  const subscription = await stripeClient.subscriptions.create({
    customer: customerID,
    items: [
      {
        price: planID,
        quantity,
      },
    ],
    metadata: {
      accountURN,
    },
  })

  return subscription
}

export const updateSubscription = async ({
  subscriptionID,
  planID,
  quantity,
}: UpdateSubscriptionParams) => {
  const stripeClient = new Stripe(STRIPE_API_SECRET, {
    apiVersion: '2022-11-15',
  })

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
  })

  return subscription
}
