import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAddressClient from '@proofzero/platform-clients/address'
import { type AccountURN } from '@proofzero/urns/account'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  reconcileAppSubscriptions,
  updateSubscriptionMetadata,
} from '~/services/billing/stripe'
import { RollupError } from '@proofzero/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(context.env.Account, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const starbaseClient = createStarbaseClient(context.env.Starbase, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })
    const addressClient = createAddressClient(context.env.Address, {
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

        const entitlements = await accountClient.getEntitlements.query({
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
            accountClient,
            starbaseClient,
            addressClient,
            billingURL: `${context.env.CONSOLE_URL}/billing`,
            settingsURL: `${context.env.CONSOLE_URL}`,
          },
          context.env
        )

        break
      case 'customer.updated':
        const { invoice_settings, metadata: cusMeta } = event.data.object as {
          id: string
          invoice_settings?: {
            default_payment_method: string
          }
          metadata: {
            accountURN: AccountURN
          }
        }

        if (invoice_settings?.default_payment_method) {
          const paymentData = await accountClient.getStripePaymentData.query({
            accountURN: cusMeta.accountURN,
          })
          paymentData.paymentMethodID = invoice_settings.default_payment_method
          await accountClient.setStripePaymentData.mutate({
            ...paymentData,
            accountURN: cusMeta.accountURN,
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
            addressClient.sendBillingNotification.mutate({
              email,
              name: name || 'Client',
            }),
            accountClient.cancelServicePlans.mutate({
              account: metaDel.accountURN,
              subscriptionID: subIdDel,
              deletePaymentData: event.type === 'customer.deleted',
            }),
            starbaseClient.deleteSubscriptionPlans.mutate({
              accountURN: metaDel.accountURN,
            }),
          ])
        }

        break
    }

    return null
  }
)
