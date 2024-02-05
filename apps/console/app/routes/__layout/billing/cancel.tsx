import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type ActionFunction } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'

import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { voidInvoice } from '@proofzero/utils/billing/stripe'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    await requireJWT(request, context.env)

    const fd = await request.formData()

    const invoiceId = fd.get('invoice_id') as string

    const headers = request.headers
    let returnURL = headers.get('Referer') as string

    const flashSession = await getFlashSession(request, context.env)

    try {
      await voidInvoice(invoiceId, context.env.SECRET_STRIPE_API_KEY)
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
