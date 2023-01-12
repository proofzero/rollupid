import { AddressURNSpace } from '@kubelt/urns/address'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { Outlet, useOutletContext } from '@remix-run/react'
import { redirect } from 'react-router-dom'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address } = params

  const galaxyClient = await getGalaxyClient()

  const urn = AddressURNSpace.urn(address as string) // TODO: introduce new sub-urn hash
  // check if address is registered to an account
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN: `${urn}?+addr_type=eth`,
    })
    .then((res) => res.profileFromAddress)
    .catch((err) => {
      // this could return null if the address is not linked to an account
      // or the account is linked and marked as private
      // or if the account is invalid
      return null
    })

  // if profile then this address is linked
  // and it has been marked as public
  // and therefore can be redirected /u/<handle>
  if (profile) {
    // TODO: check for handle

    // redirect to /u/<handle> if handle present
    return redirect(`/u/${profile.handle}`)
  }
  return null
}

const Eth = () => {
  const ctx = useOutletContext()

  return <Outlet context={ctx} />
}

export default Eth
