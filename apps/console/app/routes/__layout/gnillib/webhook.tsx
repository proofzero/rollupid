import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import createAddressClient from '@proofzero/platform-clients/address'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { type AccountURN } from '@proofzero/urns/account'
import { ServicePlanType } from '@proofzero/types/account'
import { updateSubscriptionMetadata } from '~/services/billing/stripe'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })
    const addressClient = createAddressClient(Address, {
      ...getAuthzHeaderConditionallyFromToken(undefined),
      ...traceHeader,
    })

    const stripeClient = new Stripe(STRIPE_API_SECRET, {
      apiVersion: '2022-11-15',
    })

    const whSecret = STRIPE_WEBHOOK_SECRET

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
        const {
          id,
          quantity,
          metadata: subMeta,
        } = event.data.object as {
          id: string
          quantity: number
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

        if (subMeta.handled) {
          console.info(
            `Subscription ${id} - ${event.type} already handled synchronously`
          )

          subMeta.handled = null

          await updateSubscriptionMetadata({
            id,
            metadata: subMeta,
          })

          return null
        }

        await accountClient.updateEntitlements.mutate({
          accountURN: subMeta.accountURN,
          subscriptionID: id,
          quantity,
          type: ServicePlanType.PRO,
        })

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
