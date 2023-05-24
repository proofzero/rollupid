import {
  CryptoAddressType,
  EmailAddressType,
  NodeType,
  OAuthAddressType,
} from '@proofzero/types/address'
import type { AddressURN } from '@proofzero/urns/address'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { getGalaxyClient } from './clients'
import type { FullProfile } from '../types'
import type { AccountURN } from '@proofzero/urns/account'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getValidGallery } from './alchemy'
import { GetAddressProfilesQuery } from '@proofzero/galaxy-client'

export const getAccountProfile = async (
  {
    accountURN,
  }: {
    accountURN: AccountURN
  },
  traceSpan: TraceSpan
) => {
  const profile = await ProfileKV.get<FullProfile>(accountURN, 'json')

  if (profile && profile.gallery)
    profile.gallery = await getValidGallery({
      gallery: profile.gallery,
      accountURN,
      traceSpan,
    })

  return profile
}

export const getAuthorizedApps = async (jwt: string, traceSpan: TraceSpan) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )

  const { authorizedApps } = await galaxyClient.getAuthorizedApps(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return authorizedApps
}

export const getAccountAddresses = async ({
  jwt,
  accountURN,
  traceSpan,
}: {
  jwt?: string
  accountURN?: AccountURN
  traceSpan: TraceSpan
}) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan!)
  )
  const addressesRes = await galaxyClient.getConnectedAddresses(
    { targetAccountURN: accountURN },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return addressesRes.addresses || []
}

export const getAccountCryptoAddresses = async ({
  jwt,
  accountURN,
  traceSpan,
}: {
  jwt?: string
  accountURN?: AccountURN
  traceSpan: TraceSpan
}) => {
  const addresses = await getAccountAddresses({ jwt, accountURN, traceSpan })

  // TODO: need to type qc and rc
  const cryptoAddresses =
    addresses
      .filter((e) => [NodeType.Crypto, NodeType.Vault].includes(e.rc.node_type))
      .map((address) => address.qc.alias.toLowerCase() as string) ||
    ([] as string[])

  return cryptoAddresses
}

export const getAddressProfiles = async (
  jwt: string,
  addressURNList: AddressURN[],
  traceSpan: TraceSpan
): Promise<GetAddressProfilesQuery['addressProfiles']> => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan)
  )
  const addressProfilesRes = await galaxyClient.getAddressProfiles(
    {
      addressURNList,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { addressProfiles } = addressProfilesRes

  return addressProfiles
}

export const getProfileTypeTitle = (type: string) => {
  switch (type) {
    case CryptoAddressType.ETH:
      return 'Ethereum'
    case EmailAddressType.Email:
      return 'Email'
    case OAuthAddressType.Apple:
      return 'Apple'
    case OAuthAddressType.Discord:
      return 'Discord'
    case OAuthAddressType.GitHub:
      return 'GitHub'
    case OAuthAddressType.Google:
      return 'Google'
    case OAuthAddressType.Microsoft:
      return 'Microsoft'
    case OAuthAddressType.Twitter:
      return 'Twitter'
    default:
      return ''
  }
}
