import { Profile } from '@kubelt/galaxy-client'
import { CryptoAddressType } from '@kubelt/types/address'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { generateHashedIDRef } from '@kubelt/urns/idref'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { redirect } from 'react-router-dom'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address, type } = params
  if (!address) throw new Error('No address provided with request')

  const galaxyClient = await getGalaxyClient()

  const addressURN = AddressURNSpace.componentizedUrn(
    generateHashedIDRef(CryptoAddressType.ETH, address),
    { addr_type: CryptoAddressType.ETH },
    { alias: address }
  )

  console.log({ addressURN, address })
  // check if address is registered to an account
  const profile = await galaxyClient
    .getProfileFromAddress({
      addressURN,
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
    // todo: do public eth / ens / githun / twitter lookup switch on $type
    // galaxyclient.addressProfile({ addressURN: urn })
    // if found then show claim account layout

    throw json({ error: 'not found' }, { status: 404 })
  }
  // if profile then this address is linked
  // and it has been marked as public
  // and therefore can be redirected /u/<handle>
  if (profile.handle) {
    // redirect to /u/<handle> if handle present
    return redirect(`/u/${profile.handle}`)
  }

  if (profile?.addresses?.length) {
    const handle = AddressURNSpace.decode(
      profile.addresses[0].urn as AddressURN
    )
    return redirect(`/u/${handle}`)
  }

  return json({
    profile,
    addressUrn: AddressURNSpace.getBaseURN(addressURN),
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
