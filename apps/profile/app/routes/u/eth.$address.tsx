import { Profile } from '@kubelt/galaxy-client'
import { CryptoAddressType } from '@kubelt/types/address'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { IDRefURNSpace } from '@kubelt/urns/idref'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { keccak256 } from 'ethers/lib/utils'
import { redirect } from 'react-router-dom'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address } = params

  const idref = IDRefURNSpace(CryptoAddressType.ETH).urn(address as string)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))

  const galaxyClient = await getGalaxyClient()

  const urn = AddressURNSpace.urn(hash) // TODO: introduce new sub-urn hash
  // check if address is registered to an account
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN: `${urn}?+addr_type=eth?=alias=${address}`,
    })
    .then((res) => res.profileFromAddress)
    .catch((err) => {
      console.log({ err })
      // this could return null if the address is not linked to an account
      // or the account is linked and marked as private
      // or if the account is invalid
      return null
    })

  if (!profile) {
    throw json({ error: 'not found' }, { status: 404 })
  }
  // if profile then this address is linked
  // and it has been marked as public
  // and therefore can be redirected /u/<handle>
  if (profile.handle) {
    // TODO: check for handle

    // redirect to /u/<handle> if handle present
    return redirect(`/u/${profile.handle}`)
  }
  return json({
    profile,
    addressUrn: urn,
  })
}

const Eth = () => {
  const { profile, addressUrn } = useLoaderData<{
    profile: Profile
    addressUrn: AddressURN
  }>()

  return (
    <>
      TODO: some simple splash page using the profile loader data plus maybe
      some eth specific stuff
      {JSON.stringify(profile)}
    </>
  )
}

export default Eth
