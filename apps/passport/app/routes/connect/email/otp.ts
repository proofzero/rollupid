import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { json } from '@remix-run/cloudflare'
import { getAddressClient, getStarbaseClient } from '~/platform.server'

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getAuthzCookieParams } from '~/session.server'
import type { EmailThemeProps } from '@proofzero/platform/email/src/emailFunctions'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ServicePlanType } from '@proofzero/types/account'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    try {
      const qp = new URL(request.url).searchParams

      const email = qp.get('email')
      if (!email)
        throw new BadRequestError({ message: 'No address included in request' })

      const addressURN = AddressURNSpace.componentizedUrn(
        generateHashedIDRef(EmailAddressType.Email, email.toLowerCase()),
        { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
        { alias: email, hidden: 'true' }
      )

      const addressClient = getAddressClient(
        addressURN,
        context.env,
        context.traceSpan
      )

      let clientId: string = ''
      try {
        const res = await getAuthzCookieParams(request, context.env)
        clientId = res.clientId
      } catch (ex) {
        throw new InternalServerError({
          message:
            'Could not complete authentication. Please return to application and try again.',
        })
      }
      const starbaseClient = getStarbaseClient(
        undefined,
        context.env,
        context.traceSpan
      )

      let appDetails, emailTheme, customDomain
      if (clientId !== 'console' && clientId !== 'passport') {
        ;[appDetails, emailTheme, customDomain] = await Promise.all([
          starbaseClient.getAppDetails.query({
            clientId,
          }),
          starbaseClient.getEmailOTPTheme.query({
            clientId,
          }),
          starbaseClient.getCustomDomain.query({
            clientId,
          }),
        ])
      }

      if (appDetails?.appPlan === ServicePlanType.FREE) {
        emailTheme = undefined
      }

      let themeProps: EmailThemeProps | undefined
      if (appDetails && appDetails.app) {
        themeProps = {
          privacyURL: appDetails.privacyURL as string,
          termsURL: appDetails.termsURL as string,
          logoURL: emailTheme?.logoURL,
          contactURL: emailTheme?.contact,
          address: emailTheme?.address,
          appName: appDetails.app.name,
        }

        if (customDomain) {
          themeProps.hostname = customDomain.hostname
        }
      }

      const state = await addressClient.generateEmailOTP.mutate({
        email,
        themeProps,
      })
      return json({ state })
    } catch (e) {
      console.error('Error generating email OTP', e)
      throw e
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    if (!email)
      throw new BadRequestError({
        message: 'No email address included in request',
      })

    const addressURN = AddressURNSpace.componentizedUrn(
      generateHashedIDRef(EmailAddressType.Email, email.toLowerCase()),
      { node_type: NodeType.Email, addr_type: EmailAddressType.Email },
      { alias: email, hidden: 'true' }
    )
    const addressClient = getAddressClient(
      addressURN,
      context.env,
      context.traceSpan
    )

    const successfulVerification = await addressClient.verifyEmailOTP.mutate({
      code: formData.get('code') as string,
      state: formData.get('state') as string,
    })

    return json({ addressURN, successfulVerification })
  }
)
