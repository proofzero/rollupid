import type { Profile, Link, Gallery, Node } from '@kubelt/galaxy-client'
import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'
import { AddressURN } from '@kubelt/urns/address'
import { getGalaxyClient } from '~/helpers/clients'

export const getAccountProfile = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()

  const profileRes = await galaxyClient.getProfile(undefined, {
    [PlatformJWTAssertionHeader]: jwt,
  })

  const { profile, links, gallery, connectedAddresses } = profileRes
  return { profile, links, gallery, connectedAddresses } as {
    profile: Profile
    links: Link[]
    gallery: Gallery[]
    connectedAddresses: Node[]
  }
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

export const getAddressProfiles = async (
  jwt: string,
  addressURNList: AddressURN[]
) => {
  const galaxyClient = await getGalaxyClient()
  const addressProfileRes = await galaxyClient.getAddressProfiles(
    {
      addressURNList,
    },
    {
      [PlatformJWTAssertionHeader]: jwt,
    }
  )

  const { addressProfiles } = addressProfileRes

  return addressProfiles
}
