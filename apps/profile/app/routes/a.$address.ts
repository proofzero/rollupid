import { AddressURNSpace } from '@kubelt/urns/address'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ params }) => {
  const { address } = params

  const urn = AddressURNSpace.urn(address as string) // TODO: introduce new sub-urn hash

  // check if address is registered to an account
  const galaxyClient = await getGalaxyClient()
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN: `${urn}?+addr_type=oauth`,
    })
    .then((res) => res.profileFromAddress)
    .catch((err) => {
      // this could return null if the address is not linked to an account
      // or the account is linked and marked as private
      // or if the account is invalid
      return null
    })

  // if registered check if account has /u/<handle>
  if (profile) {
    // TODO: check for handle

    // redirect to /u/<handle> if present
    return redirect(`/u/${profile.displayName}`)
  }

  return json('Invalid address', { status: 404 })
}
