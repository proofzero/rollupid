import { defer, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/utilities/platform.server'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { requireJWT } from '~/utilities/session.server'

import type { AuthorizedProfile } from '~/types'
import type { LoaderFunction } from '@remix-run/cloudflare'
import type { Profile } from '@kubelt/galaxy-client'

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
    const galaxyClient = await getGalaxyClient()

    const authorizations = await starbaseClient.getAuthorizedAccounts.query({
      client,
    })

    const authorizedProfiles = await Promise.all(
      authorizations.map<Promise<AuthorizedProfile>>(async (authorization) => {
        const profileRes = await galaxyClient.getProfileFromAccount({
          accountURN: authorization.accountURN,
        })
        return {
          profile: profileRes.profile as Profile,
          timestamp: authorization.timestamp,
          accountURN: authorization.accountURN,
        }
      })
    )

    return json<LoaderData>({ authorizedProfiles })
  } catch (ex) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}
