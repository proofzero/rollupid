import type { LoaderFunction } from '@remix-run/cloudflare'
import { getValidatedSessionContext } from '~/session.server'
import { getAccessClient } from '~/platform.server'
import { BadRequestError } from '@proofzero/errors'
import { getKeyedClaimValues } from '@proofzero/security/persona'

export const loader: LoaderFunction = async ({ request, params, context }) => {
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

  const scopeSets = await accessClient.getAuthorizedAppScopes.query({
    clientId,
    accountURN: accountUrn,
  })

  const mappedScopeAuthorizations = await Promise.all(
    scopeSets.map(async (scopes) => {
      const claims = await getKeyedClaimValues(
        accountUrn,
        clientId,
        scopes,
        {
          edgesFetcher: context.env.Edges,
          accountFetcher: context.env.Account,
          accessFetcher: context.env.Access,
        },
        context.traceSpan
      )

      return {
        scopes,
        claims,
      }
    })
  )

  return mappedScopeAuthorizations
}
