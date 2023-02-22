import { useEffect, useState } from 'react'
import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import type { appDetailsProps } from '~/components/Applications/Auth/ApplicationAuth'
import { useFetcher, useOutletContext } from '@remix-run/react'

const Users = () => {
  const authFetcher = useFetcher()

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
