import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import { useLoaderData, useNavigate } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { requireJWT } from '~/utilities/session.server'
import { defer, json } from '@remix-run/cloudflare'
import createStarbaseClient from '@kubelt/platform-clients/starbase'
import { useState, useEffect } from 'react'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import type { AuthorizedAccountsOutput } from '@kubelt/platform/starbase/src/types'

// don't change this constant unless it's necessary
// this constant also affects /$clientId root route
export const PAGE_LIMIT = 10

type LoaderData = {
  edgesResult?: Promise<AuthorizedAccountsOutput>
  PROFILE_APP_URL?: string
  error?: any
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const jwt = await requireJWT(request)
  const srcUrl = new URL(request.url)

  try {
    const client = params.clientId
    const page = srcUrl.searchParams.get('page')

    // because offset is shown as an integer page number I convert it here
    // to the actual offset for the database. (page starts with 1, not 0)
    const offset = page ? (parseInt(page) - 1) * PAGE_LIMIT : 0

    if (!client) {
      throw new Error('clientId is required')
    }

    const starbaseClient = createStarbaseClient(
      Starbase,
      getAuthzHeaderConditionallyFromToken(jwt)
    )

    const edgesResult = starbaseClient.getAuthorizedAccounts.query({
      client,
      opt: {
        offset,
        limit: PAGE_LIMIT,
      },
    })

    return defer<LoaderData>({ edgesResult, PROFILE_APP_URL })
  } catch (ex: any) {
    console.error(ex)
    return json<LoaderData>({ error: ex })
  }
}

const Users = () => {
  const navigate = useNavigate()
  const { edgesResult, PROFILE_APP_URL, error } = useLoaderData()
  const [authorizedProfiles, setAuthorizedProfiles] = useState({
    accounts: null,
    metadata: null,
  })

  useEffect(() => {
    ;(async () => {
      if (edgesResult) {
        const awaitedEdgesResult = await edgesResult
        if (!awaitedEdgesResult.metadata.offset) {
          awaitedEdgesResult.metadata.offset = 0
        }

        setAuthorizedProfiles(awaitedEdgesResult)
      }
    })()
  }, [edgesResult])

  return (
    <ApplicationUsers
      PAGE_LIMIT={PAGE_LIMIT}
      PROFILE_APP_URL={PROFILE_APP_URL}
      loadUsers={(offset: number) => {
        const query = new URLSearchParams()
        if (offset || offset === 0)
          query.set('page', (offset / PAGE_LIMIT + 1).toString())
        navigate(`?${query}`)
      }}
      error={error || null}
      authorizedProfiles={authorizedProfiles.accounts || []}
      metadata={
        authorizedProfiles.metadata || {
          offset: 0,
          limit: PAGE_LIMIT,
          edgesReturned: 0,
        }
      }
    />
  )
}

export default Users
