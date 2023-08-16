import type { LoaderFunction } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'
import { getCoreClient } from '~/platform.server'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { identityURN } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )
    const { clientId } = params

    if (!clientId) {
      throw new BadRequestError({ message: 'Client ID is required for query' })
    }

    const coreClient = getCoreClient({ context })
    return await coreClient.authorization.getAuthorizedAppScopes.query({
      clientId,
      identityURN,
    })
  }
)
