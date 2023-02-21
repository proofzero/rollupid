import { json } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import createAccountClient from '@kubelt/platform-clients/account'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { requireJWT } from '~/utilities/session.server'
import type { AccountURN } from '@kubelt/urns/account'

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
    if (!client) {
      throw new Error('clientId is required')
    }

    const starbaseClient = createStarbaseClient(
      Starbase,
      getAuthzHeaderConditionallyFromToken(jwt)
    )
    const accountClient = createAccountClient(Account)

    const authorizedProfiles = await starbaseClient.getAuthorizedAccounts.query(
      {
        client,
      }
    )

    return json<LoaderData>({ authorizedProfiles })
  } catch (ex) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}
