import { redirect } from '@remix-run/cloudflare'
import type { ActionFunction } from '@remix-run/cloudflare'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
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
import { posthogCall } from '@proofzero/utils/posthog'
import { type AccountURN } from '@proofzero/urns/account'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const clientId = formData.get('clientId')?.toString()
    const published = formData.get('published')?.toString() === '1'

    if (!clientId)
      throw new BadRequestError({ message: 'Client ID is required' })

    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt as string)
    const accountURN = parsedJwt.sub as AccountURN

    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })
    try {
      await starbaseClient.deleteApp.mutate({ clientId })
      await posthogCall({
        apiKey: POSTHOG_API_KEY,
        eventName: 'app_deleted',
        distinctId: accountURN,
        properties: {
          clientId,
          published,
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
