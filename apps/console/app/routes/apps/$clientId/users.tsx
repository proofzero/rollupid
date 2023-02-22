import { useEffect } from 'react'
import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'
import { useFetcher, useLoaderData, useOutletContext } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

export const loader: LoaderFunction = (args) => {
  return json({
    PROFILE_APP_URL,
  })
}

const Users = () => {
  const authFetcher = useFetcher()
  const { PROFILE_APP_URL } = useLoaderData()

  const { appDetails } = useOutletContext<{
    appDetails: appDetailsProps
  }>()

  const loadUsers = (offset: number = 0) => {
    const query = new URLSearchParams()
    query.set('client', appDetails.clientId!)
    query.set('offset', offset.toString())
    authFetcher.load(`/api/authorized-accounts?${query}`)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  console.log({ data: authFetcher.data })

  return (
    <ApplicationUsers
      PROFILE_APP_URL={PROFILE_APP_URL}
      fetcherState={{
        loadingDetails: authFetcher.state,
        type: authFetcher.type,
      }}
      error={authFetcher.data?.error || null}
      authorizedProfiles={authFetcher.data?.authorizedProfiles.users || []}
      loadUsers={loadUsers}
      metadata={authFetcher.data?.authorizedProfiles.metadata}
    />
  )
}

export default Users
