import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { createCustomer, updateCustomer } from '~/services/billing/stripe'
import { AccountURN } from '@proofzero/urns/account'
import { AddressURN } from '@proofzero/urns/address'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const { email, emailURN, name } = JSON.parse(
      fd.get('payload') as string
    ) as {
      email: string
      emailURN: AddressURN
      name: string
    }

    let paymentData = await accountClient.getStripePaymentData.query({
      accountURN,
    })
    if (!paymentData) {
      const customer = await createCustomer({
        email,
        name,
        accountURN,
      })

      paymentData = {
        customerID: customer.id,
        email,
        name,
      }
    } else {
      paymentData = {
        ...paymentData,
        email,
        name,
      }

      await updateCustomer({
        customerID: paymentData.customerID,
        email,
        name,
      })
    }

    await accountClient.setStripePaymentData.mutate({
      ...paymentData,
      accountURN,
    })

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    flashSession.flash('success_toast', 'Payment data updated')

    return redirect('/gnillib', {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }
)
