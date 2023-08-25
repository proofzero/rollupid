import {
  CryptoAccountType,
  EmailAccountType,
  NodeType,
  OAuthAccountType,
  WebauthnAccountType,
} from '@proofzero/types/account'
import type { AccountURN } from '@proofzero/urns/account'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { getGalaxyClient } from './clients'
import { imageFromAccountType } from './icons'
import type { FullProfile } from '../types'
import type { IdentityURN } from '@proofzero/urns/identity'
import type { TraceSpan } from '@proofzero/platform-middleware/trace'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getValidGallery } from './alchemy'
import { GetAccountProfilesQuery } from '@proofzero/galaxy-client'

export const getIdentityProfile = async (
  {
    identityURN,
    jwt,
  }: {
    identityURN: IdentityURN
    jwt?: string
  },
  env: Env,
  traceSpan: TraceSpan
) => {
  // note: jwt is only important for setting profile in profile identity settings
  const profile = await env.ProfileKV.get<FullProfile>(identityURN, 'json')

  if (profile && profile.gallery)
    profile.gallery = await getValidGallery(
      {
        gallery: profile.gallery,
        identityURN,
      },
      env,
      traceSpan
    )

  return profile
}

export const getAuthorizedApps = async (
  jwt: string,
  env: Env,
  traceSpan: TraceSpan
) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan),
    env
  )

  const { authorizedApps } = await galaxyClient.getAuthorizedApps(
    undefined,
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return authorizedApps
}

export const getIdentityAccounts = async (
  {
    jwt,
    identityURN,
  }: {
    jwt?: string
    identityURN?: IdentityURN
  },
  env: Env,
  traceSpan: TraceSpan
) => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan!),
    env
  )

  const accountsRes = await galaxyClient.getConnectedAccounts(
    { targetIdentityURN: identityURN },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  return accountsRes.accounts || []
}

export const getIdentityCryptoAddresses = async (
  {
    jwt,
    identityURN,
  }: {
    jwt?: string
    identityURN?: IdentityURN
  },
  env: Env,
  traceSpan: TraceSpan
) => {
  const accounts = await getIdentityAccounts(
    { jwt, identityURN },
    env,
    traceSpan
  )

  // TODO: need to type qc and rc
  const cryptoAccounts =
    accounts
      .filter((e) => {
        return (
          [NodeType.Crypto, NodeType.Vault].includes(e.rc.node_type) &&
          e.rc.addr_type === CryptoAccountType.ETH
        )
      })
      .map((account) => {
        return account.qc.alias.toLowerCase() as string
      }) || ([] as string[])

  return cryptoAccounts
}

export const getAccountProfiles = async (
  jwt: string,
  accountURNList: AccountURN[],
  env: Env,
  traceSpan: TraceSpan
): Promise<GetAccountProfilesQuery['accountProfiles']> => {
  const galaxyClient = await getGalaxyClient(
    generateTraceContextHeaders(traceSpan),
    env
  )
  const accountProfilesRes = await galaxyClient.getAccountProfiles(
    {
      accountURNList,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  const { accountProfiles } = accountProfilesRes

  return accountProfiles
}

export const getProfileTypeTitle = (type: string) => {
  switch (type) {
    case CryptoAccountType.ETH:
      return 'Ethereum'
    case EmailAccountType.Email:
      return 'Email'
    case WebauthnAccountType.WebAuthN:
      return 'Passkey'
    case OAuthAccountType.Apple:
      return 'Apple'
    case OAuthAccountType.Discord:
      return 'Discord'
    case OAuthAccountType.GitHub:
      return 'GitHub'
    case OAuthAccountType.Google:
      return 'Google'
    case OAuthAccountType.Microsoft:
      return 'Microsoft'
    case OAuthAccountType.Twitter:
      return 'Twitter'
    default:
      return ''
  }
}
