import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createCoreClient from '@proofzero/platform-clients/core'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { reconcileAppSubscriptions } from '~/services/billing/stripe'
import { InternalServerError, RollupError } from '@proofzero/errors'
import { type AccountURN } from '@proofzero/urns/account'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { ServicePlanType } from '@proofzero/types/billing'
import { BillingCustomerURN } from '@proofzero/urns/billing'

type StripeInvoicePayload = {
  id: string
  subscription: string
  customer: string
  payment_intent: string
  lines: {
    data: Array<{
      price: { product: string }
      amount: number
      quantity: number
    }>
  }
  metadata: any
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const stripeClient = new Stripe(context.env.SECRET_STRIPE_API_KEY, {
      apiVersion: '2022-11-15',
    })

    const whSecret = context.env.SECRET_STRIPE_WEBHOOK_SECRET
    const payload = await request.text()
    const sig = request.headers.get('stripe-signature') as string

    const event = await stripeClient.webhooks.constructEventAsync(
      payload,
      sig,
      whSecret
    )

    let URN

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const {
          id,
          metadata: subMeta,
          status: subStatus,
          latest_invoice: latestInvoice,
        } = event.data.object as {
          id: string
          latest_invoice: string
          metadata: {
            URN?: BillingCustomerURN
          }
          status: string
        }

        const invoice = await stripeClient.invoices.retrieve(latestInvoice)

        // We don't want to do anything with subscription
        // if payment for it failed
        if (
          (subStatus !== 'active' && subStatus !== 'trialing') ||
          invoice.status !== 'paid'
        ) {
          return null
        }

        URN = subMeta.URN as BillingCustomerURN

        const entitlements = await coreClient.billing.getEntitlements.query({
          URN,
        })
        if (entitlements?.subscriptionID !== id) {
          throw new RollupError({
            message: `Subscription ID ${id} does not match entitlements subscription ID ${entitlements?.subscriptionID}`,
          })
        }

        await reconcileAppSubscriptions(
          {
            subscriptionID: id,
            URN,
            coreClient,
            billingURL: `${context.env.CONSOLE_URL}/billing`,
            settingsURL: `${context.env.CONSOLE_URL}`,
          },
          context.env
        )

        break
      case 'customer.updated':
        const {
          email,
          invoice_settings,
          metadata: cusMeta,
        } = event.data.object as {
          id: string
          email: string
          invoice_settings?: {
            default_payment_method: string
          }
          metadata: {
            URN?: BillingCustomerURN
          }
        }

        URN = cusMeta.URN as BillingCustomerURN

        if (invoice_settings?.default_payment_method) {
          const paymentData =
            await coreClient.billing.getStripePaymentData.query({
              URN,
            })
          paymentData.paymentMethodID = invoice_settings.default_payment_method

          // This needs to happen because
          // we already have paymentData
          // in production without
          // accountURN
          let inferredAccountURN
          if (paymentData && !paymentData.accountURN) {
            inferredAccountURN =
              await coreClient.account.getAccountURNForEmail.query(
                email.toLowerCase()
              )

            if (!inferredAccountURN) {
              throw new InternalServerError({
                message: `Could not find account for email ${email}`,
              })
            }
          }

          const accountURN =
            paymentData.accountURN ?? (inferredAccountURN as AccountURN)

          await coreClient.billing.setStripePaymentData.mutate({
            ...paymentData,
            accountURN,
            URN,
          })
        }

        break
      case 'invoice.payment_succeeded':
        const {
          customer: customerSuccess,
          lines: linesSuccess,
          metadata: metaSuccess,
        } = event.data.object as StripeInvoicePayload
        const customerDataSuccess = await stripeClient.customers.retrieve(
          customerSuccess
        )

        const updatedItems = {} as {
          [key: string]: { amount: number; quantity: number }
        }

        linesSuccess.data.forEach((line) => {
          if (updatedItems[line.price.product]) {
            updatedItems[line.price.product] = {
              amount: updatedItems[line.price.product].amount + line.amount,
              quantity:
                updatedItems[line.price.product].quantity + line.quantity,
            }
          } else {
            updatedItems[line.price.product] = {
              // this amount is negative when we cancel or update subsription,
              // but this event is being fired anyway
              amount: line.amount,
              quantity: line.amount > 0 ? line.quantity : -line.quantity,
            }
          }
        })

        const purchasedItems = Object.keys(updatedItems)
          .filter((key) => {
            // we don't count cancelled subscriptions
            return updatedItems[key].amount > 0
          })
          .map((key) => {
            return {
              productID: key,
              amount: updatedItems[key].amount,
              quantity: updatedItems[key].quantity,
            }
          })
        if (
          !customerDataSuccess.deleted &&
          customerDataSuccess.email &&
          purchasedItems?.length
        ) {
          const { email, name } = customerDataSuccess
          const products = await Promise.all(
            purchasedItems.map((item) => {
              if (item) return stripeClient.products.retrieve(item.productID)
            })
          )

          await createAnalyticsEvent({
            eventName: 'identity_purchased_entitlement',
            apiKey: context.env.POSTHOG_API_KEY,
            distinctId: customerDataSuccess.metadata.URN,
            properties: {
              plans: purchasedItems.map((item) => ({
                quantity: item.quantity,
                name: products.find(
                  (product) => product?.id === item?.productID
                )!.name,
                type: ServicePlanType.PRO,
              })),
            },
          })

          await coreClient.account.sendSuccessfulPaymentNotification.mutate({
            email,
            name: name || 'Client',
            plans: purchasedItems.map((item) => ({
              quantity: item.quantity,
              name: products.find((product) => product?.id === item?.productID)!
                .name,
            })),
          })
        }

        break

      case 'invoice.payment_failed':
        const { customer: customerFail, payment_intent: paymentIntentFail } =
          event.data.object as StripeInvoicePayload
        const customerDataFail = await stripeClient.customers.retrieve(
          customerFail
        )
        const paymentIntentInfo = await stripeClient.paymentIntents.retrieve(
          paymentIntentFail
        )

        if (
          !customerDataFail.deleted &&
          customerDataFail.email &&
          paymentIntentInfo.status !== 'requires_action'
        ) {
          const { email, name } = customerDataFail

          await coreClient.account.sendFailedPaymentNotification.mutate({
            email,
            name: name || 'Client',
          })
        }
        break
      case 'customer.deleted':
      case 'customer.subscription.deleted':
        const {
          customer: customerDel,
          id: subIdDel,
          metadata: metaDel,
        } = event.data.object as {
          customer: string
          id: string
          metadata: {
            URN?: BillingCustomerURN
          }
        }
        const customerDataDel = await stripeClient.customers.retrieve(
          customerDel
        )
        if (!customerDataDel.deleted && customerDataDel.email) {
          const { email, name } = customerDataDel

          URN = metaDel.URN as BillingCustomerURN

          await Promise.all([
            coreClient.account.sendBillingNotification.mutate({
              email,
              name: name || 'Client',
            }),
            coreClient.billing.cancelServicePlans.mutate({
              URN,
              subscriptionID: subIdDel,
              deletePaymentData: event.type === 'customer.deleted',
            }),
            coreClient.starbase.deleteSubscriptionPlans.mutate({
              URN,
            }),
          ])
        }

        break
    }

    return null
  }
)
