import { json } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { requireJWT } from '~/utilities/session.server'

import type { AuthorizedProfile } from '~/types'
import type { LoaderFunction } from '@remix-run/cloudflare'

type LoaderData = {
  authorizedProfiles?: AuthorizedProfile[]
  error?: any
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const srcUrl = new URL(request.url)

  try {
    const client = srcUrl.searchParams.get('client')
    const offset = srcUrl.searchParams.get('offset')
    const limit = srcUrl.searchParams.get('limit')

    if (!client) {
      throw new Error('clientId is required')
    }

    const starbaseClient = createStarbaseClient(
      Starbase,
      getAuthzHeaderConditionallyFromToken(jwt)
    )

    const authorizedProfiles = await starbaseClient.getAuthorizedAccounts.query(
      {
        client,
        opt: {
          offset: offset ? parseInt(offset) * 10 : 0,
          limit: limit ? parseInt(limit) : 10,
        },
      }
    )

    return json<LoaderData>({ authorizedProfiles })
  } catch (ex) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}
