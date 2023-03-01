import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { ActionFunction } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const { clientId } = params

  if (!clientId) {
    throw new Error('Client ID is required for query')
  }

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.revokeAppAuthorizations(
    {
      clientId,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return null
}
