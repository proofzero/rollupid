import { generateTraceContextHeaders } from '@kubelt/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { LoaderFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request, params, context }) => {
  const jwt = await requireJWT(request)
  const { clientId } = params

  if (!clientId) {
    throw new Error('Client ID is required for query')
  }

  const galaxyClient = await getGalaxyClient({
    ...generateTraceContextHeaders(context.traceSpan),
  })

  const { scopes } = await galaxyClient.getAuthorizedAppScopes(
    {
      clientId,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return scopes
}
