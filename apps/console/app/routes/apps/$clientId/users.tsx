import React from 'react'
import { ApplicationUsers } from '~/components/Applications/Users/ApplicationUsers'
import { useOutletContext } from '@remix-run/react'
import type { AuthorizedProfile } from '~/types'
import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = (args) => {
  return redirect(`/apps/${args.params.clientId}`)
}

const Users = () => {
  const outletContext = useOutletContext<{
    authorizedProfiles: AuthorizedProfile[]
  }>()

  return (
    <ApplicationUsers authorizedProfiles={outletContext.authorizedProfiles} />
  )
}

export default Users
