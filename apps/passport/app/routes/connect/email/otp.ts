import { EmailAddressType, NodeType } from '@proofzero/types/address'
import { AddressURNSpace } from '@proofzero/urns/address'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { json } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'

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

      const coreClient = getCoreClient({ context, addressURN })

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

      let appPlan, appProps, emailTheme, customDomain
      if (clientId !== 'console' && clientId !== 'passport') {
        ;[appPlan, appProps, emailTheme, customDomain] = await Promise.all([
          coreClient.starbase.getAppPlan.query({
            clientId,
          }),
          coreClient.starbase.getAppPublicProps.query({
            clientId,
          }),
          coreClient.starbase.getEmailOTPTheme.query({
            clientId,
          }),
          coreClient.starbase.getCustomDomain.query({
            clientId,
          }),
        ])
      }

      let themeProps: EmailThemeProps | undefined
      if (appProps) {
        themeProps = {
          privacyURL: appProps.privacyURL as string,
          termsURL: appProps.termsURL as string,
          logoURL:
            appPlan !== ServicePlanType.FREE ? emailTheme?.logoURL : undefined,
          contactURL:
            appPlan !== ServicePlanType.FREE ? emailTheme?.contact : undefined,
          address:
            appPlan !== ServicePlanType.FREE ? emailTheme?.address : undefined,
          appName: appProps.name,
        }

        if (appPlan !== ServicePlanType.FREE && customDomain) {
          themeProps.hostname = customDomain.hostname
        }
      }

      const state = await coreClient.address.generateEmailOTP.mutate({
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
    const coreClient = getCoreClient({ context, addressURN })
    const successfulVerification =
      await coreClient.address.verifyEmailOTP.mutate({
        code: formData.get('code') as string,
        state: formData.get('state') as string,
      })

    return json({ addressURN, successfulVerification })
  }
)
