import { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import {
  UnauthorizedError,
  InternalServerError,
  BadRequestError,
} from '@proofzero/errors'
import createCoreClient, {
  CoreClientType,
} from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { PaymentData, ServicePlanType } from '@proofzero/types/billing'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import {
  parseJwt,
  getAuthzHeaderConditionallyFromToken,
} from '@proofzero/utils'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getEmailDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { ActionFunction, json } from '@remix-run/cloudflare'
import Stripe from 'stripe'
import { ToastNotification } from '~/types'
import {
  requireJWT,
  getFlashSession,
  commitFlashSession,
} from '~/utilities/session.server'
import { setPurchaseToastNotification } from '~/utils'
import {
  StripeInvoice,
  UnpaidInvoiceNotification,
  createOrUpdateSubscription,
  getCurrentAndUpcomingInvoices,
} from '~/utils/billing'
import { IDENTITY_GROUP_OPTIONS } from '@proofzero/platform/identity/src/constants'
import { reconcileSubscriptions } from '@proofzero/utils/billing/stripe'

export enum TxProduct {
  Entitlements = 'entitlements',
  Seats = 'seats',
}

export type LoaderData = {
  STRIPE_PUBLISHABLE_KEY: string
  paymentData?: PaymentData
  entitlements: {
    [ServicePlanType.PRO]: number
  }
  toastNotification?: ToastNotification
  connectedEmails: DropdownSelectListItem[]
  invoices: StripeInvoice[]
  groupURN?: IdentityGroupURN
  unpaidInvoiceURL?: string
  groupSeats: {
    total: number
    used: number
  }
}

export const loader = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let groupURN
    if (params.groupID) {
      groupURN = IdentityGroupURNSpace.urn(
        params.groupID as string
      ) as IdentityGroupURN
    }

    const groupSeats = {
      total: 0,
      used: 0,
    }
    const targetURN: IdentityRefURN = groupURN ?? identityURN
    if (IdentityGroupURNSpace.is(targetURN)) {
      const { read } =
        await coreClient.identity.hasIdentityGroupPermissions.query({
          identityURN,
          identityGroupURN: targetURN as IdentityGroupURN,
        })

      if (!read) {
        throw new UnauthorizedError({
          message: 'You are not authorized to read this identity group.',
        })
      }

      groupURN = targetURN as IdentityGroupURN

      const [groups, seatQuery, invitations] = await Promise.all([
        coreClient.identity.listIdentityGroups.query(),
        coreClient.billing.getIdentityGroupSeats.query({
          URN: groupURN,
        }),
        coreClient.identity.getIdentityGroupMemberInvitations.query({
          identityGroupURN: groupURN,
        }),
      ])

      const seats = seatQuery?.quantity ?? 0

      const targetGroup = groups.find((g) => g.URN === groupURN!)

      // This wonderful max min is supposed to do the following:
      // - Prevent displaying negative group seats (due to some bug)
      // - Prevent displaying more seats than the group has (due to some bug)
      const groupMemberCount = Math.max(
        Math.min(
          (targetGroup?.members.length ?? 0) +
            invitations.length -
            IDENTITY_GROUP_OPTIONS.maxFreeMembers,
          seats
        ),
        0
      )

      groupSeats.total = seats
      groupSeats.used = groupMemberCount
    }

    const { plans } = await coreClient.billing.getEntitlements.query({
      URN: targetURN,
    })

    const flashSession = await getFlashSession(request, context.env)

    let toastNotification = undefined
    const toastStr = flashSession.get('toast_notification')
    if (toastStr) {
      toastNotification = JSON.parse(toastStr)
    }

    const connectedAccounts = await coreClient.identity.getAccounts.query({
      URN: targetURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: targetURN,
    })
    if (spd && !spd.accountURN) {
      const targetAccountURN =
        await coreClient.account.getAccountURNForEmail.query(
          spd.email.toLowerCase()
        )

      if (!targetAccountURN) {
        throw new InternalServerError({
          message: 'No address found for email',
        })
      }

      await coreClient.billing.setStripePaymentData.mutate({
        ...spd,
        accountURN: targetAccountURN,
        URN: targetURN,
      })

      spd.accountURN = targetAccountURN
    }

    const cuInvoices = await getCurrentAndUpcomingInvoices(
      spd,
      context.env.SECRET_STRIPE_API_KEY
    )

    let unpaidInvoiceURL
    cuInvoices.some((invoice) => {
      if (invoice.status)
        if (['uncollectible', 'open'].includes(invoice.status)) {
          unpaidInvoiceURL = invoice.url as string
        }
    })

    const invoices = cuInvoices.slice(0, 7)

    return json<LoaderData>(
      {
        STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
        paymentData: spd,
        entitlements: {
          [ServicePlanType.PRO]:
            plans?.[ServicePlanType.PRO]?.entitlements ?? 0,
        },
        connectedEmails,
        invoices,
        toastNotification,
        groupURN,
        unpaidInvoiceURL,
        groupSeats,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient: CoreClientType = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    let groupURN
    if (params.groupID) {
      groupURN = IdentityGroupURNSpace.urn(
        params.groupID as string
      ) as IdentityGroupURN
    }

    const targetURN: IdentityRefURN = groupURN ?? identityURN
    if (IdentityGroupURNSpace.is(targetURN)) {
      const { write } =
        await coreClient.identity.hasIdentityGroupPermissions.query({
          identityURN,
          identityGroupURN: targetURN as IdentityGroupURN,
        })

      if (!write) {
        throw new UnauthorizedError({
          message: 'You are not authorized to update this identity group.',
        })
      }

      groupURN = targetURN as IdentityGroupURN
    }

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: targetURN,
    })

    const invoices = await getCurrentAndUpcomingInvoices(
      spd,
      context.env.SECRET_STRIPE_API_KEY
    )

    const flashSession = await getFlashSession(request, context.env)

    await UnpaidInvoiceNotification({
      invoices,
      flashSession,
      env: context.env,
    })

    const fd = await request.formData()
    const { customerID, quantity, txType, txProduct } = JSON.parse(
      fd.get('payload') as string
    ) as {
      customerID: string
      quantity: number
      txType: 'buy' | 'remove'
      txProduct?: TxProduct
    }

    if ((quantity < 1 && txType === 'buy') || quantity < 0) {
      throw new BadRequestError({
        message: `Invalid quantity. Please enter a valid quantity.`,
      })
    }

    let sub
    if (!txProduct || txProduct === TxProduct.Entitlements) {
      if (IdentityURNSpace.is(targetURN)) {
        const apps = await coreClient.starbase.listApps.query()
        const assignedEntitlementCount = apps.filter(
          (a) => a.appPlan === ServicePlanType.PRO
        ).length
        if (assignedEntitlementCount > quantity) {
          throw new BadRequestError({
            message: `Invalid quantity. Change ${
              quantity - assignedEntitlementCount
            } of the ${assignedEntitlementCount} apps to a different plan first.`,
          })
        }
      }

      const entitlements = await coreClient.billing.getEntitlements.query({
        URN: targetURN,
      })

      sub = await createOrUpdateSubscription({
        customerID,
        planID: context.env.SECRET_STRIPE_PRO_PLAN_ID,
        SECRET_STRIPE_API_KEY: context.env.SECRET_STRIPE_API_KEY,
        quantity,
        subscriptionID: entitlements.subscriptionID,
        URN: targetURN,
      })
    } else if (txProduct === TxProduct.Seats) {
      const seats = await coreClient.billing.getIdentityGroupSeats.query({
        URN: groupURN as IdentityGroupURN,
      })
      const subID = seats?.subscriptionID

      sub = await createOrUpdateSubscription({
        customerID,
        planID: context.env.SECRET_STRIPE_GROUP_SEAT_PLAN_ID,
        SECRET_STRIPE_API_KEY: context.env.SECRET_STRIPE_API_KEY,
        quantity,
        subscriptionID: subID,
        URN: targetURN,
      })
    }

    if (!sub) {
      throw new BadRequestError({
        message: `Invalid target. Please select a valid target.`,
      })
    }

    if (
      (txType === 'buy' &&
        (sub.status === 'active' || sub.status === 'trialing')) ||
      txType !== 'buy'
    ) {
      await reconcileSubscriptions(
        {
          subscriptionID: sub.id,
          URN: targetURN,
          coreClient,
          billingURL: `${context.env.CONSOLE_URL}/billing`,
          settingsURL: `${context.env.CONSOLE_URL}`,
        },
        context.env.SECRET_STRIPE_API_KEY,
        context.env.SECRET_STRIPE_PRO_PLAN_ID,
        context.env.SECRET_STRIPE_GROUP_SEAT_PLAN_ID
      )
    }

    if (txType === 'buy') {
      setPurchaseToastNotification({
        sub,
        flashSession,
        txProduct,
      })
    }
    if (txType === 'remove') {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Success,
          message: `${
            !txProduct || txProduct === TxProduct.Entitlements
              ? 'Entitlement(s)'
              : 'Seat(s)'
          } successfully removed`,
        })
      )
    }

    let status, client_secret, payment_method
    if (
      sub.latest_invoice &&
      (sub.latest_invoice as Stripe.Invoice).payment_intent
    ) {
      // lots of stripe type casting since by default many
      // props are strings (not expanded versions)
      ;({ status, client_secret, payment_method } = (
        sub.latest_invoice as Stripe.Invoice
      ).payment_intent as Stripe.PaymentIntent)
    }

    return json(
      {
        status,
        client_secret,
        payment_method,
        subId: sub.id,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)
