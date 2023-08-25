import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, json, redirect } from '@remix-run/cloudflare'
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
import { IdentityURN } from '@proofzero/urns/identity'
import { AccountURN } from '@proofzero/urns/account'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const identityURN = parsedJwt.sub as IdentityURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const returnURL = request.headers.get('Referer')
    if (!returnURL) {
      throw new BadRequestError({
        message: 'No Referer found in request.',
      })
    }

    const fd = await request.formData()
    const { email, accountURN, name, URN } = JSON.parse(
      fd.get('payload') as string
    ) as {
      email: string
      accountURN: AccountURN
      name: string
      URN?: IdentityRefURN
    }

    if (!email?.length || !accountURN?.length || !name?.length) {
      throw new BadRequestError({ message: 'Email and name are required' })
    }
    let targetURN = URN ?? identityURN
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
    }

    let paymentData = await coreClient.billing.getStripePaymentData.query({
      URN: targetURN,
    })
    if (!paymentData) {
      const customer = await createCustomer(
        {
          email,
          name,
          URN: targetURN,
        },
        context.env
      )

      paymentData = {
        customerID: customer.id,
        email,
        name,
        accountURN,
      }
    } else {
      paymentData = {
        ...paymentData,
        email,
        name,
        accountURN,
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

    await coreClient.billing.setStripePaymentData.mutate({
      ...paymentData,
      URN: targetURN,
      accountURN,
    })

    const flashSession = await getFlashSession(request, context.env)
    flashSession.flash(
      'toast_notification',
      JSON.stringify({
        type: ToastType.Success,
        message: 'Payment data updated',
      })
    )

    const needRedirect = fd.get('redirect') as string
    if (needRedirect === 'false') {
      return json({ success: true })
    }

    return redirect(returnURL, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, context.env),
      },
    })
  }
)
