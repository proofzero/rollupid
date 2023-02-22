import { useEffect, useState } from 'react'
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

  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const query = new URLSearchParams()
    query.set('client', appDetails.clientId!)
    query.set('offset', offset.toString())
    authFetcher.load(`/api/authorized-accounts?${query}`)
  }, [offset])

  return (
    <ApplicationUsers
      PROFILE_APP_URL={PROFILE_APP_URL}
      fetcherState={{
        loadingDetails: authFetcher.state,
        type: authFetcher.type,
      }}
      error={authFetcher.data?.error || null}
      authorizedProfiles={authFetcher.data?.authorizedProfiles || []}
      setOffset={setOffset}
      offset={offset}
    />
  )
}

export default Users
