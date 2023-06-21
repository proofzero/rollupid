import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN } from '@proofzero/urns/account'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import {
  commitFlashSession,
  getFlashSession,
  parseJwt,
  requireJWT,
} from '~/utilities/session.server'
import createAccountClient from '@proofzero/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  createSubscription,
  updateSubscription,
} from '~/services/billing/stripe'
import { ServicePlanType } from '@proofzero/types/account'

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
    const { customerID, quantity } = JSON.parse(
      fd.get('payload') as string
    ) as {
      customerID: string
      quantity: number
    }

    const entitlements = await accountClient.getEntitlements.query()

    let sub
    if (!entitlements.subscriptionID) {
      sub = await createSubscription({
        customerID: customerID,
        planID: 'price_1NJaDgFEfyl69U7XQBHZDiDM',
        quantity: +quantity,
        accountURN,
      })
    } else {
      sub = await updateSubscription({
        subscriptionID: entitlements.subscriptionID,
        planID: 'price_1NJaDgFEfyl69U7XQBHZDiDM',
        quantity: +quantity,
      })
    }

    await accountClient.updateEntitlements.mutate({
      accountURN,
      subscriptionID: sub.id,
      quantity: +quantity,
      type: ServicePlanType.PRO,
    })

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    flashSession.flash('billing_success', 'Order successfully submitted')

    return redirect('/gnillib', {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }
)
