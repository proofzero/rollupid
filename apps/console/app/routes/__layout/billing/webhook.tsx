import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createCoreClient from '@proofzero/platform-clients/core'
import { type AccountURN } from '@proofzero/urns/account'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  reconcileAppSubscriptions,
  updateSubscriptionMetadata,
} from '~/services/billing/stripe'
import { InternalServerError, RollupError } from '@proofzero/errors'
import { AddressURN } from '@proofzero/urns/address'

type StripeInvoicePayload = {
  customer: string
  lines: {
    data: Array<{
      price: { product: string }
      amount: number
      quantity: number
    }>
  }
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

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const { id, metadata: subMeta } = event.data.object as {
          id: string
          metadata: {
            accountURN: AccountURN
            handled?: string | null
          }
        }

        if (event.data.previous_attributes) {
          let metadataUpdateEvent = false

          const { metadata } = event.data.previous_attributes as {
            metadata?: {
              handled?: string
            }
          }

          // If previous attributes had a handled flag and the current
          // event does not, then the webhook is handling only the
          // handled removal so we shouldn't move further
          if (
            !subMeta.handled &&
            metadata?.handled &&
            JSON.parse(metadata.handled)
          ) {
            console.info(
              `Cleared Subscription ${id} - ${event.type} handled flag`
            )
            metadataUpdateEvent = true
          }

          if (metadataUpdateEvent) {
            return null
          }
        }

        // When synchronously handling subscription update effects
        // a flag is set to prevent the webhook from handling it again
        // when it is received asynchronously
        // This call clears the flag
        if (subMeta.handled) {
          console.info(
            `Subscription ${id} - ${event.type} already handled synchronously`
          )

          subMeta.handled = null

          await updateSubscriptionMetadata(
            {
              id,
              metadata: subMeta,
            },
            context.env
          )

          return null
        }

        const entitlements = await coreClient.account.getEntitlements.query({
          accountURN: subMeta.accountURN,
        })
        if (entitlements?.subscriptionID !== id) {
          throw new RollupError({
            message: `Subscription ID ${id} does not match entitlements subscription ID ${entitlements?.subscriptionID}`,
          })
        }

        await reconcileAppSubscriptions(
          {
            subscriptionID: id,
            accountURN: subMeta.accountURN,
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
            accountURN: AccountURN
          }
        }

        if (invoice_settings?.default_payment_method) {
          const paymentData =
            await coreClient.account.getStripePaymentData.query({
              accountURN: cusMeta.accountURN,
            })
          paymentData.paymentMethodID = invoice_settings.default_payment_method

          // This needs to happen because
          // we already have paymentData
          // in production without
          // addressURN
          let inferredAddressURN
          if (paymentData && !paymentData.addressURN) {
            inferredAddressURN =
              await addressClient.getAddressURNForEmail.query(
                email.toLowerCase()
              )

            if (!inferredAddressURN) {
              throw new InternalServerError({
                message: `Could not find address for email ${email}`,
              })
            }
          }

          const addressURN =
            paymentData.addressURN ?? (inferredAddressURN as AddressURN)

          await coreClient.account.setStripePaymentData.mutate({
            ...paymentData,
            addressURN,
            accountURN: cusMeta.accountURN,
          })
        }

        break
      case 'invoice.payment_succeeded':
        const { customer: customerSuccess, lines: linesSuccess } = event.data
          .object as StripeInvoicePayload
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

          await coreClient.address.sendSuccessfulPaymentNotification.mutate({
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
        const { customer: customerFail } = event.data
          .object as StripeInvoicePayload
        const customerDataFail = await stripeClient.customers.retrieve(
          customerFail
        )
        if (!customerDataFail.deleted && customerDataFail.email) {
          const { email, name } = customerDataFail

          await coreClient.address.sendFailedPaymentNotification.mutate({
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
            accountURN: AccountURN
          }
        }
        const customerDataDel = await stripeClient.customers.retrieve(
          customerDel
        )
        if (!customerDataDel.deleted && customerDataDel.email) {
          const { email, name } = customerDataDel

          await Promise.all([
            coreClient.address.sendBillingNotification.mutate({
              email,
              name: name || 'Client',
            }),
            coreClient.account.cancelServicePlans.mutate({
              account: metaDel.accountURN,
              subscriptionID: subIdDel,
              deletePaymentData: event.type === 'customer.deleted',
            }),
            coreClient.starbase.deleteSubscriptionPlans.mutate({
              accountURN: metaDel.accountURN,
            }),
          ])
        }

        break
    }

    return null
  }
)
