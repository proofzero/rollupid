import type { Profile } from '@kubelt/galaxy-client'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AddressURN } from '@kubelt/urns/address'
import { getGalaxyClient } from '~/helpers/clients'

export const getAccountProfile = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    [PlatformJWTAssertionHeader]: jwt,
  })

  const profile = profileRes.profile as Profile
  return profile
}

export const getAccountAddresses = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()
  const addressesRes = await galaxyClient.getConnectedAddresses(undefined, {
    [PlatformJWTAssertionHeader]: jwt,
  })
  const addresses = addressesRes.connectedAddresses
  return addresses
}

export const getAddressProfile = async (
  jwt: string,
  addressURN: AddressURN
) => {
  const galaxyClient = await getGalaxyClient()
  const addressProfile = await galaxyClient.getProfileFromAddress(
    {
      addressURN,
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  const profile = addressProfile.profileFromAddress

  return profile
}
