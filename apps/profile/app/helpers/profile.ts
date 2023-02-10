import type { Profile, Link, Gallery, Node } from '@kubelt/galaxy-client'
import { AddressURN } from '@kubelt/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'
import { getGalaxyClient } from '~/helpers/clients'

export const getAccountProfile = async (jwt: string) => {
  const galaxyClient = await getGalaxyClient()

  const profileRes = await galaxyClient.getProfile(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

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
  const addressesRes = await galaxyClient.getConnectedAddresses(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const addresses = addressesRes.connectedAddresses
  return addresses
}

export const getAddressProfile = async (addressURN: AddressURN) => {
  const galaxyClient = await getGalaxyClient()
  const addressProfile = await galaxyClient.getProfileFromAddress({
    addressURN,
  })

  const profile = addressProfile

  return {
    ...profile.profile,
    links: profile.links,
    gallery: profile.gallery,
    connectedAccounts: profile.connectedAddresses,
  }
}

export const getAddressProfiles = async (
  jwt: string,
  addressURNList: AddressURN[]
) => {
  const galaxyClient = await getGalaxyClient()
  console.log({ addressURNList })
  const addressProfileRes = await galaxyClient.getAddressProfiles(
    {
      addressURNList,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { addressProfiles } = addressProfileRes

  return addressProfiles
}
