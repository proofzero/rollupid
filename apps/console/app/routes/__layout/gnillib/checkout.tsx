import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { ServicePlanType } from '@proofzero/types/account'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { beginCheckout } from '~/services/billing/stripe'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request }) => {
    const flashSession = await getFlashSession(request.headers.get('Cookie'))

    flashSession.flash('billing_toast', `Order successfully submitted`)

    return redirect('/gnillib', {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const action = fd.get('action')
    switch (action) {
      case 'purchase': {
        const {
          planType,
          quantity,
        }: {
          planType: ServicePlanType
          quantity: number
        } = JSON.parse(fd.get('payload') as string)

        const nonce = hexlify(randomBytes(8))

        await accountClient.registerServicePlanOrder.mutate({
          planType: planType,
          quantity: quantity,
          nonce,
        })

        return beginCheckout({
          planId: '42',
          planType,
          quantity,
          nonce,
        })
      }
    }

    return null
  }
)
