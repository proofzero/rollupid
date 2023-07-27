import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type ActionFunction } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'

import { voidInvoice } from '~/services/billing/stripe'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { type AccountURN } from '@proofzero/urns/account'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const fd = await request.formData()

    const invoiceId = fd.get('invoice_id') as string
    const customerId = fd.get('customer_id') as string

    const headers = request.headers
    let returnURL = headers.get('Referer') as string

    const flashSession = await getFlashSession(request, context.env)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const spd = await coreClient.account.getStripePaymentData.query({
      accountURN,
    })

    try {
      await voidInvoice(
        invoiceId,
        customerId,
        context.env.SECRET_STRIPE_API_KEY,
        spd.invoiceCreditBalance
      )
      flashSession.flash(
        'toastNotification',
        JSON.stringify({
          type: ToastType.Success,
          message: 'Invoice successfully cancelled.',
        })
      )
    } catch (e) {
      console.error(e)
      flashSession.flash(
        'toastNotification',
        JSON.stringify({
          type: ToastType.Error,
          message: 'Invoice cancellation failed.',
        })
      )
    }

    return redirect(returnURL, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, context.env),
      },
    })
  }
)
