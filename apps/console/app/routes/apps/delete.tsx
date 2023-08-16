import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { requireJWT } from '~/utilities/session.server'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  JsonError,
  getErrorCause,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { type IdentityURN } from '@proofzero/urns/identity'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const clientId = formData.get('clientId')?.toString()

    if (!clientId)
      throw new BadRequestError({ message: 'Client ID is required' })

    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt as string)
    const identityURN = parsedJwt.sub as IdentityURN

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })
    try {
      await coreClient.starbase.deleteApp.mutate({ clientId })
      await createAnalyticsEvent({
        apiKey: context.env.POSTHOG_API_KEY,
        eventName: 'app_deleted',
        distinctId: identityURN,
        properties: {
          client_id: clientId,
        },
      })
      return redirect('/')
    } catch (error) {
      const cause = getErrorCause(error)
      const traceparent = context.traceSpan.getTraceParent()
      if (cause instanceof BadRequestError) {
        throw cause
      } else {
        console.error(error)
        throw JsonError(
          new InternalServerError({
            message: 'Could not delete the application',
            cause: error,
          }),
          traceparent
        )
      }
    }
  }
)

export default () => {}
