import React from 'react'
import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import { useOutletContext } from '@remix-run/react'
import type { AuthorizedProfile } from '~/types'

const Users = () => {
  const outletContext = useOutletContext<{
    authorizedProfiles: AuthorizedProfile[]
  }>()

  return (
    <ApplicationUsers authorizedProfiles={outletContext.authorizedProfiles} />
  )
}

export default Users
