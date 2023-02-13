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

    const authorizations = await starbaseClient.getAuthorizedAccounts.query({
      client,
    })

    const authorizedProfiles = await Promise.all(
      authorizations.map<Promise<AuthorizedProfile>>(async (authorization) => {
        const profileRes = await accountClient.getProfile.query({
          account: authorization.accountURN as AccountURN,
        })
        return {
          imageURL: profileRes?.pfp?.image as string,
          name: profileRes?.displayName,
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
