import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { getAddressProfile } from '~/helpers/profile'

export const loader: LoaderFunction = async ({ params }) => {
  const { address } = params

  if (!address) throw new Error('No address provided in URL')
  const urn = AddressURNSpace.urn(address)
  const profile = await getAddressProfile(urn as AddressURN)

  if (!profile) {
    throw json({ message: 'Profile could not be resolved' }, { status: 404 })
  }

  delete profile.connectedAccounts
  delete profile.handle
  delete profile.defaultAddress

  return json(profile)
}
