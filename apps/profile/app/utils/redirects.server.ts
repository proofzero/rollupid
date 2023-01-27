import { Profile } from '@kubelt/galaxy-client'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export const getRedirectUrlForProfile = (
  profile: Profile
): string | undefined => {
  let result = undefined

  if (profile.handle) {
    //TODO: when handle strategy is implemented, this should redirect to
    //the URL: /u/${handle} which would do a galaxy lookup by that handle
    //and load the profile corresponding to it
    console.warn('Handle logic not implemented')
  }

  if (profile.defaultAddress) {
    //TODO: when the hidden flag is implemented, for public views this is where we'd
    //check if the default address has the hidden flag unset in the addresses array
    //If hidden, we 404
    const idref = AddressURNSpace.decode(profile.defaultAddress)
    result = `/a/${idref}`
  } else if (profile.addresses && profile.addresses.length) {
    //If no defaultAddress, we'll pick the first address in array
    const firstNode = profile.addresses[0]

    if (firstNode.rc && firstNode.qc.alias) {
      const idref = AddressURNSpace.decode(firstNode.urn as AddressURN)
      result = `/a/${idref}`
    }
  }

  return result
}
