import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { FullProfile } from '~/types'

export const getRedirectUrlForProfile = (
  profile: FullProfile
): string | undefined => {
  if (profile.handle) {
    //TODO: when handle strategy is implemented, this should redirect to
    //the URL: /u/${handle} which would do a galaxy lookup by that handle
    //and load the profile corresponding to it
    console.warn('Handle logic not implemented')
  }

  const addressUrn = profile.addresses[0].baseUrn as AddressURN
  const idref = AddressURNSpace.decode(addressUrn)
  return `/a/${idref}`
}
