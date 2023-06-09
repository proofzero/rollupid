import { ActionFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import createAddressClient from '@proofzero/platform-clients/address'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { EmailOTPTheme } from '@proofzero/platform.starbase/src/jsonrpc/validators/app'
import {
  JsonError,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const clientId = params.clientId as string

    const jwt = await requireJWT(request)

    const formData = await request.formData()
    const theme: EmailOTPTheme = JSON.parse(formData.get('theme') as string)
    const addressURN = formData.get('addressURN') as string

    const addressClient = createAddressClient(Address, {
      [PlatformAddressURNHeader]: addressURN,
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const { address: email } = await addressClient.getAddressProfile.query()

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    let [appProps, customDomain] = await Promise.all([
      starbaseClient.getAppPublicProps.query({
        clientId,
      }),
      starbaseClient.getCustomDomain.query({
        clientId,
      }),
    ])

    try {
      await addressClient.generateEmailOTP.mutate({
        email,
        themeProps: {
          privacyURL: appProps.privacyURL as string,
          termsURL: appProps.termsURL as string,
          logoURL: theme.logoURL,
          contactURL: theme.contact,
          address: theme.address,
          appName: appProps.name,
          hostname: customDomain?.hostname,
        },
        preview: true,
      })
    } catch (e) {
      return JsonError(e, context.traceSpan.getTraceParent())
    }

    return null
  }
)
