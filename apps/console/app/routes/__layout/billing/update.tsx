import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { redirect, type ActionFunction } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { reconcileAppSubscriptions } from '~/services/billing/stripe'
import { type AccountURN } from '@proofzero/urns/account'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const fd = await request.formData()

    const subId = fd.get('subId') as string

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })
    const flashSession = await getFlashSession(request, context.env)

    try {
      await reconcileAppSubscriptions(
        {
          subscriptionID: subId,
          accountURN,
          coreClient,
          billingURL: `${context.env.CONSOLE_URL}/billing`,
          settingsURL: `${context.env.CONSOLE_URL}`,
        },
        context.env
      )

      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Success,
          message: 'Successfully purchased entitlement(s)',
        })
      )

      return redirect('/billing', {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      })
    } catch (ex) {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Success,
          message: 'Something went wrong. Please try again',
        })
      )
      return redirect('/billing', {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      })
    }
  }
)
