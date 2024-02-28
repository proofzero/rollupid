import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { type ActionFunction } from '@remix-run/cloudflare'

import Stripe from 'stripe'
import createCoreClient from '@proofzero/platform-clients/core'

import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { InternalServerError } from '@proofzero/errors'
import { type AccountURN } from '@proofzero/urns/account'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { ServicePlanType } from '@proofzero/types/billing'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { reconcileSubscriptions } from '@proofzero/utils/billing/stripe'
import { getAppDataStoragePricingEnv } from '@proofzero/utils/external-app-data'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const notificationEnabledPriceIDSet = new Set([
      context.env.SECRET_STRIPE_PRO_PLAN_ID,
    ])

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
        const { id, metadata: subMeta } = event.data.object as {
          id: string
          metadata: {
            URN?: IdentityRefURN
          }
        }

        URN = subMeta.URN as IdentityRefURN

        await reconcileSubscriptions(
          {
            subscriptionID: id,
            URN,
            coreClient,
            billingURL: `${context.env.CONSOLE_URL}/billing`,
            settingsURL: `${context.env.CONSOLE_URL}`,
          },
          context.env.SECRET_STRIPE_API_KEY,
          context.env.SECRET_STRIPE_PRO_PLAN_ID,
          context.env.SECRET_STRIPE_GROUP_SEAT_PLAN_ID
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
            URN?: IdentityRefURN
          }
        }

        URN = cusMeta.URN as IdentityRefURN

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
        const { customer: customerSuccess, lines: linesSuccess } = event.data
          .object as Stripe.Invoice
        const customerDataSuccess = await stripeClient.customers.retrieve(
          customerSuccess as string
        )

        const updatedItems = {} as {
          [key: string]: { amount: number; quantity: number; productID: string }
        }

        linesSuccess.data.forEach((line) => {
          if (line.price) {
            const priceID = line.price.id
            const productID = line.price.product as string

            if (updatedItems[priceID]) {
              updatedItems[priceID] = {
                amount: updatedItems[priceID].amount + line.amount,
                quantity: updatedItems[priceID].quantity + (line.quantity ?? 0),
                productID,
              }
            } else {
              updatedItems[priceID] = {
                // this amount is negative when we cancel or update subsription,
                // but this event is being fired anyway
                amount: line.amount,
                quantity:
                  line.amount > 0 ? line.quantity ?? 0 : -(line.quantity ?? 0),
                productID,
              }
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
              priceID: key,
              amount: updatedItems[key].amount,
              quantity: updatedItems[key].quantity,
              productID: updatedItems[key].productID,
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

          const proEntitlements = purchasedItems.filter(
            (item) => item.priceID === context.env.SECRET_STRIPE_PRO_PLAN_ID
          )

          if (proEntitlements.length > 0) {
            await createAnalyticsEvent({
              eventName: 'identity_purchased_entitlement',
              apiKey: context.env.POSTHOG_API_KEY,
              distinctId: customerDataSuccess.metadata.URN,
              properties: {
                plans: proEntitlements.map((item) => ({
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
              plans: proEntitlements.map((item) => ({
                quantity: item.quantity,
                name: products.find(
                  (product) => product?.id === item?.productID
                )!.name,
              })),
            })
          }
        }

        break
      case 'invoice.finalized':
        const { lines, subscription: invoiceSubscription } = event.data
          .object as Stripe.Invoice

        const finalizedPriceIDList = lines.data
          .filter((ili) => Boolean(ili.price))
          .map((ili) => ili.price!.id)
          .filter((val, ind, arr) => arr.indexOf(val) === ind)

        const {
          SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID,
          SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID,
          SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID,
          SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID,
        } = getAppDataStoragePricingEnv(context.env)

        if (
          finalizedPriceIDList.some(
            (pi) =>
              pi === SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID ||
              pi === SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID
          )
        ) {
          const subscription = await stripeClient.subscriptions.retrieve(
            invoiceSubscription as string
          )
          if (!subscription) {
            throw new InternalServerError({
              message: `Could not find subscription. Expected external app data package to be associated to a subscription.`,
            })
          }

          const clientID = subscription.metadata?.clientID
          if (!clientID) {
            throw new InternalServerError({
              message: `Could not find clientID in metadata.`,
            })
          }

          const externalAppDataPackage =
            await coreClient.starbase.getAppExternalDataPackage.query({
              clientId: clientID,
            })
          if (!externalAppDataPackage) {
            throw new InternalServerError({
              message: `Could not find externalAppDataPackage.`,
            })
          }

          await coreClient.starbase.externalAppDataLimitIncrement.mutate({
            clientId: clientID,
            reads: externalAppDataPackage.reads,
            writes: externalAppDataPackage.writes,
          })

          if (
            externalAppDataPackage.status ===
            ExternalAppDataPackageStatus.ToppingUp
          ) {
            await coreClient.starbase.setExternalAppDataPackageStatus.mutate({
              clientId: clientID,
              status: ExternalAppDataPackageStatus.Enabled,
            })
          }
        }

        if (
          finalizedPriceIDList.some(
            (pi) =>
              pi === SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID ||
              pi === SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID
          )
        ) {
          const subscription = await stripeClient.subscriptions.retrieve(
            invoiceSubscription as string
          )
          if (!subscription) {
            throw new InternalServerError({
              message: `Could not find subscription. Expected external app data package to be associated to a subscription.`,
            })
          }

          const clientID = subscription.metadata?.clientID
          if (!clientID) {
            throw new InternalServerError({
              message: `Could not find clientID in metadata`,
            })
          }

          if (subscription.metadata.noReset === 'true') {
            await stripeClient.subscriptions.update(subscription.id, {
              metadata: {
                noReset: null,
              },
            })
          } else {
            await coreClient.starbase.externalAppDataUsageReset.mutate({
              clientId: clientID,
            })
          }
        }

        break
      case 'invoice.payment_failed':
        const { customer: customerFail, payment_intent: paymentIntentFail } =
          event.data.object as Stripe.Invoice
        const customerDataFail = await stripeClient.customers.retrieve(
          customerFail as string
        )
        const paymentIntentInfo = await stripeClient.paymentIntents.retrieve(
          paymentIntentFail as string
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
            URN?: IdentityRefURN
          }
        }
        const customerDataDel = await stripeClient.customers.retrieve(
          customerDel
        )
        if (!customerDataDel.deleted && customerDataDel.email) {
          const { email, name } = customerDataDel

          URN = metaDel.URN as IdentityRefURN

          const delSub = event.data.object as Stripe.Subscription
          await Promise.all(
            delSub.items.data.map(async (item) => {
              if (notificationEnabledPriceIDSet.has(item.price.id)) {
                await coreClient.account.sendBillingNotification.mutate({
                  email,
                  name: name || 'Client',
                })
              }
            })
          )

          await Promise.all([
            coreClient.billing.cancelServicePlans.mutate({
              URN,
              deletePaymentData: event.type === 'customer.deleted',
            }),
            coreClient.starbase.deleteSubscriptionPlans.mutate({
              URN,
            }),
            async () => {
              if (IdentityGroupURNSpace.is(URN!)) {
                await coreClient.billing.updateIdentityGroupSeats.mutate({
                  subscriptionID: subIdDel,
                  URN: URN as IdentityGroupURN,
                  quantity: 0,
                })
              }
            },
          ])
        }

        break
    }

    return null
  }
)
