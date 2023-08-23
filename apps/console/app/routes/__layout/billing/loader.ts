import { DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { UnauthorizedError, InternalServerError } from '@proofzero/errors'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { PaymentData, ServicePlanType } from '@proofzero/types/billing'
import { BillingCustomerURN } from '@proofzero/urns/billing'
import { IdentityURN } from '@proofzero/urns/identity'
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
import { json } from '@remix-run/cloudflare'
import { ToastNotification } from '~/types'
import {
  requireJWT,
  getFlashSession,
  commitFlashSession,
} from '~/utilities/session.server'
import { StripeInvoice, getCurrentAndUpcomingInvoices } from '~/utils/billing'

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

    const targetURN: BillingCustomerURN = groupURN ?? identityURN
    if (IdentityGroupURNSpace.is(targetURN)) {
      const authorized =
        await coreClient.identity.hasIdentityGroupPermissions.query({
          identityURN,
          identityGroupURN: targetURN as IdentityGroupURN,
        })

      if (!authorized) {
        throw new UnauthorizedError({
          message: 'You are not authorized to update this identity group.',
        })
      }

      groupURN = targetURN as IdentityGroupURN
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

    const invoices = (
      await getCurrentAndUpcomingInvoices(
        spd,
        context.env.SECRET_STRIPE_API_KEY
      )
    ).slice(0, 7)

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
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)
