import type { LoaderFunction } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'
import { getAccessClient } from '~/platform.server'
import { BadRequestError } from '@proofzero/errors'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const { accountUrn } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )
    const { clientId } = params

    if (!clientId) {
      throw new BadRequestError({ message: 'Client ID is required for query' })
    }

    const accessClient = getAccessClient(context.env, context.traceSpan)
    return await accessClient.getAuthorizedAppScopes.query({
      clientId,
      accountURN: accountUrn,
    })
  }
)
