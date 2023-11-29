import type { ActionFunction } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { jwt } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    const coreClient = getCoreClient({ context, jwt })
    await coreClient.identity.resetProfileFields.mutate()

    return null
  }
)
