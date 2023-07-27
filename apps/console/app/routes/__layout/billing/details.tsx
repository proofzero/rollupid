import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
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
import { createCustomer, updateCustomer } from '~/services/billing/stripe'
import { AccountURN } from '@proofzero/urns/account'
import { AddressURN } from '@proofzero/urns/address'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const { email, addressURN, name } = JSON.parse(
      fd.get('payload') as string
    ) as {
      email: string
      addressURN: AddressURN
      name: string
    }

    let paymentData = await coreClient.account.getStripePaymentData.query({
      accountURN,
    })
    if (!paymentData) {
      const customer = await createCustomer(
        {
          email,
          name,
          accountURN,
        },
        context.env
      )

      paymentData = {
        customerID: customer.id,
        email,
        name,
        addressURN,
      }
    } else {
      paymentData = {
        ...paymentData,
        email,
        name,
        addressURN,
      }

      await updateCustomer(
        {
          customerID: paymentData.customerID,
          email,
          name,
        },
        context.env
      )
    }

    await coreClient.account.setStripePaymentData.mutate({
      ...paymentData,
      accountURN,
      addressURN,
    })

    const flashSession = await getFlashSession(request, context.env)
    flashSession.flash(
      'toast_notification',
      JSON.stringify({
        type: ToastType.Success,
        message: 'Payment data updated',
      })
    )

    return redirect('/billing', {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, context.env),
      },
    })
  }
)
