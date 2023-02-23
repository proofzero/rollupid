import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import { useLoaderData, useNavigate } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import type { AuthorizedProfile } from '~/types'
import { requireJWT } from '~/utilities/session.server'
import { json } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

type LoaderData = {
  authorizedProfiles?: {
    metadata: {
      offset?: number
      limit?: number
      edgesReturned: number
    }
    users: AuthorizedProfile[]
  }
  PROFILE_APP_URL?: string
  error?: any
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const srcUrl = new URL(request.url)

  try {
    const client = params.clientId
    const page = srcUrl.searchParams.get('page')
    const stringLimit = srcUrl.searchParams.get('limit')

    // By default the limit is set to 10
    const limit = stringLimit ? parseInt(stringLimit) : 10
    // because offset is shown as an integer page number I convert it here
    // to the actual offset for the database. (page starts with 1, not 0)
    const offset = page ? (parseInt(page) - 1) * limit : 0

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
          offset:0,
          limit,
        },
      }
    )

    if (!authorizedProfiles.metadata.offset) {
      authorizedProfiles.metadata.offset = 0
    }

    return json<LoaderData>({ authorizedProfiles, PROFILE_APP_URL })
  } catch (ex: any) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}

const Users = () => {
  const navigate = useNavigate()
  const { authorizedProfiles, PROFILE_APP_URL, error } = useLoaderData()

  return (
    <ApplicationUsers
      PROFILE_APP_URL={PROFILE_APP_URL}
      loadUsers={(offset: number) => {
        const query = new URLSearchParams()
        if (offset || offset === 0)
          query.set('page', (offset / 10 + 1).toString())
        navigate(`?${query}`)
      }}
      error={error || null}
      authorizedProfiles={authorizedProfiles.users || []}
      metadata={authorizedProfiles.metadata}
    />
  )
}

export default Users
