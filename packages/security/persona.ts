import { AccessURN, AccessURNSpace } from '@proofzero/urns/access'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'
import createEdgesClient from '@proofzero/platform-clients/edges'
import createAddressClient from '@proofzero/platform-clients/address'
import createAccessClient from '@proofzero/platform-clients/access'
import createAccountClient from '@proofzero/platform-clients/account'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import {
  BadRequestError,
  InternalServerError,
  RollupError,
  UnauthorizedError,
} from '@proofzero/errors'
import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'
import {
  AuthorizationControlSelection,
  PersonaData,
} from '@proofzero/types/application'
import { AnyURN } from '@proofzero/urns'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export async function validatePersonaData(
  accountUrn: AccountURN,
  personaData: PersonaData,
  env: { addressFetcher: Fetcher; accountFetcher: Fetcher },
  traceSpan: TraceSpan
): Promise<void> {
  //If there's nothing to validate, return right away
  if (!personaData) return

  for (const [scopeName, claimValue] of Object.entries(personaData)) {
    //TODO: Make this more generic to apply to any claims
    if (scopeName === 'email') {
      const addressUrnForEmail = claimValue
      if (!AddressURNSpace.is(addressUrnForEmail))
        throw new BadRequestError({
          message: 'Bad data received for address identifier',
        })

      const addressClient = createAddressClient(env.addressFetcher, {
        [PlatformAddressURNHeader]: addressUrnForEmail,
        ...generateTraceContextHeaders(traceSpan),
      })
      const retrievedAccountUrn = await addressClient.getAccount.query()

      if (retrievedAccountUrn !== accountUrn)
        throw new BadRequestError({
          message: 'Address provided does not belong to authenticated account',
        })

      const addressProfile = await addressClient.getAddressProfile.query()
      if (
        addressProfile.type !== OAuthAddressType.Google &&
        addressProfile.type !== OAuthAddressType.Microsoft &&
        addressProfile.type !== OAuthAddressType.Apple &&
        addressProfile.type !== EmailAddressType.Email
      )
        throw new BadRequestError({
          message: 'Address provided is not an email-compatible address',
        })
    } else if (['connected_accounts', 'erc_4337'].includes(scopeName)) {
      const authorizedAddressUrns = claimValue

      //If user selection is ALL, there's nothing further to validate
      if (claimValue === AuthorizationControlSelection.ALL) continue

      //If user selection is not ALL, check expected data type in personaData, ie. AddressURN[]
      if (
        !(
          authorizedAddressUrns &&
          authorizedAddressUrns instanceof Array &&
          authorizedAddressUrns.every((e) => AddressURNSpace.is(e))
        )
      ) {
        throw new BadRequestError({
          message: 'Bad data received for list of address identifiers',
        })
      }

      const accountClient = createAccountClient(env.accountFetcher, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const accountAddresses = await accountClient.getAddresses.query({
        account: accountUrn,
      })

      const ownedAddressURNList =
        accountAddresses?.map((aa) => aa.baseUrn) || []

      //Check if authorized address set is fully owned by the account doing the authorization
      if (
        !accountAddresses ||
        !authorizedAddressUrns.every((addressURN) =>
          ownedAddressURNList.includes(addressURN)
        )
      ) {
        throw new UnauthorizedError({
          message:
            'Mismatch in addresses provided vs addresses connected to account',
        })
      }
    }
  }
}

/* Sets authorization references to other nodes in the graph. Assumes that
 * validation has been executed and trusts validity of data being passed in */
export async function setPersonaReferences(
  accessNode: AccessURN,
  scope: string[],
  personaData: PersonaData,
  env: {
    edgesFetcher: Fetcher
  },
  traceSpan: TraceSpan
) {
  //We could have multiple nodes being referenced across multiple scope values
  //so we create a unique listing of them before creating the edges
  const uniqueAuthorizationReferences = new Set<AnyURN>()

  for (const scopeEntry of scope) {
    //TODO: make this more generic so it applies to all claims
    if (scopeEntry === 'email' && personaData.email) {
      uniqueAuthorizationReferences.add(personaData.email)
    } else if (
      scopeEntry === 'connected_accounts' &&
      personaData.connected_accounts &&
      personaData.connected_accounts instanceof Array
    ) {
      //This (correctly) gets skipped when personaData value of
      //connected_accounts is set to ALL
      personaData.connected_accounts.forEach((addressUrn) =>
        uniqueAuthorizationReferences.add(addressUrn)
      )
    } else if (
      scopeEntry === 'erc_4337' &&
      personaData.erc_4337 &&
      personaData.erc_4337 instanceof Array
    ) {
      personaData.erc_4337.forEach((addressUrn) =>
        uniqueAuthorizationReferences.add(addressUrn)
      )
    }
  }

  const edgesClient = createEdgesClient(
    env.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  //TODO: The next set of 3 operations will need to be optmizied into a single
  //SQL transaction

  //Get existing references
  const edgesToDelete = await edgesClient.getEdges.query({
    query: { tag: EDGE_HAS_REFERENCE_TO, src: { baseUrn: accessNode } },
  })

  //Delete existing references
  edgesToDelete.edges.forEach(
    async (edge) =>
      await edgesClient.removeEdge.mutate({
        tag: edge.tag,
        dst: edge.dst.baseUrn,
        src: edge.src.baseUrn,
      })
  )

  //Add new references
  const edges = await Promise.allSettled(
    [...uniqueAuthorizationReferences].map((refUrn) => {
      //This returns promises that get awaited collectively above
      return edgesClient.makeEdge.mutate({
        src: accessNode,
        tag: EDGE_HAS_REFERENCE_TO,
        dst: refUrn,
      })
    })
  )
}

export type ClaimValueType =
  | string
  | {
      [K: string]: ClaimValueType
    }
  | ClaimValueType[]

export type ClaimName = string
export type ScopeValueName = string
export type ClaimValuePairs = Record<ClaimName, ClaimValueType>

export type ScopeClaimsResponse = {
  claims: ClaimValuePairs
  meta: {
    urns: AnyURN[]
    valid: boolean
  }
}

export type ClaimData = {
  [s: ScopeValueName]: ScopeClaimsResponse
}

export type Fetchers = {
  accountFetcher?: Fetcher
  accessFetcher?: Fetcher
  addressFetcher?: Fetcher
  edgesFetcher: Fetcher
}
export type ScopeClaimRetrieverFunction = (
  scopeEntry: ScopeValueName,
  accountUrn: AccountURN,
  clientId: string,
  accessUrn: AccessURN,
  fetchers: Fetchers,
  personaData: PersonaData,
  traceSpan: TraceSpan
) => Promise<ClaimData>

function createInvalidClaimDataObject(scopeEntry: ScopeValueName): ClaimData {
  return {
    [scopeEntry]: {
      claims: {},
      meta: {
        urns: [],
        valid: false,
      },
    },
  }
}

class InvalidPersonaDataError extends RollupError {
  constructor() {
    super({ message: 'Invalid persona data' })
  }
}

//These retriever functions will be moved elsewhere as part of ticket #2013
async function emailClaimRetriever(
  scopeEntry: ScopeValueName,
  accountUrn: AccountURN,
  clientId: string,
  accessUrn: AccessURN,
  fetchers: Fetchers,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  const edgesClient = createEdgesClient(
    fetchers.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  if (personaData.email) {
    const emailAddressUrn = personaData.email
    const edgesResults = await edgesClient.getEdges.query({
      query: {
        src: { baseUrn: accessUrn },
        dst: { baseUrn: emailAddressUrn },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })
    const emailAddress = edgesResults.edges[0].dst.qc.alias
    const claimData: ClaimData = {
      [scopeEntry]: {
        claims: {
          email: emailAddress,
        },
        meta: {
          urns: [emailAddressUrn],
          valid: true,
        },
      },
    }
    return claimData
  }
  throw new InvalidPersonaDataError()
}

async function profileClaimsRetriever(
  scopeEntry: ScopeValueName,
  accountUrn: AccountURN,
  clientId: string,
  accessUrn: AccessURN,
  fetchers: Fetchers,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  const edgesClient = createEdgesClient(
    fetchers.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )
  const nodeResult = await edgesClient.findNode.query({
    baseUrn: accountUrn,
  })
  if (nodeResult && nodeResult.baseUrn) {
    return {
      [scopeEntry]: {
        claims: {
          name: nodeResult.qc.name,
          picture: nodeResult.qc.picture,
        },
        meta: {
          urns: [nodeResult.baseUrn],
          valid: true,
        },
      },
    }
  } else throw new InvalidPersonaDataError()
}

async function erc4337ClaimsRetriever(
  scopeEntry: ScopeValueName,
  accountUrn: AccountURN,
  clientId: string,
  accessUrn: AccessURN,
  fetchers: Fetchers,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  if (!fetchers.addressFetcher)
    throw new InternalServerError({
      message: 'Address fetcher not specified',
    })
  const result = {
    erc_4337: {
      claims: {
        erc_4337: new Array(),
      },
      meta: {
        urns: new Array(),
        valid: true,
      },
    },
  } as const

  if (personaData.erc_4337 === AuthorizationControlSelection.ALL) {
    //Referencable persona submission pointing to all connected sc wallets
    //at any point in time
    if (!fetchers.accountFetcher)
      throw new InternalServerError({
        message: 'No account fetcher specified',
      })
    const accountClient = createAccountClient(fetchers.accountFetcher, {
      ...generateTraceContextHeaders(traceSpan),
    })
    const accountAddresses =
      (
        await accountClient.getAddresses.query({
          account: accountUrn,
        })
      )?.filter(
        (address) => address.rc.addr_type === CryptoAddressType.Wallet
      ) || []

    for (const addressNode of accountAddresses) {
      result.erc_4337.claims.erc_4337.push({
        type: addressNode.rc.addr_type,
        identifier: addressNode.qc.alias,
      })
      result.erc_4337.meta.urns.push(addressNode.baseUrn)
    }
  } else {
    const walletAddressUrns = personaData.erc_4337 as AddressURN[]
    for (const addressUrn of walletAddressUrns) {
      const addressClient = createAddressClient(fetchers.addressFetcher!, {
        ...generateTraceContextHeaders(traceSpan),
        [PlatformAddressURNHeader]: addressUrn,
      })
      const profile = await addressClient.getAddressProfile.query()
      result.erc_4337.claims.erc_4337.push({
        nickname: profile.title,
        address: profile.address,
      })
      result.erc_4337.meta.urns.push(addressUrn)
    }
  }
  return result
}

async function connectedAccountsClaimsRetriever(
  scopeEntry: ScopeValueName,
  accountUrn: AccountURN,
  clientId: string,
  accessUrn: AccessURN,
  fetchers: Fetchers,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  const result = {
    connected_accounts: {
      claims: {
        connected_accounts: new Array(),
      },
      meta: {
        urns: new Array(),
        valid: true,
      },
    },
  }

  if (personaData.connected_accounts === AuthorizationControlSelection.ALL) {
    //Referencable persona submission pointing to all connected addresses
    //at any point in time
    if (!fetchers.accountFetcher)
      throw new InternalServerError({
        message: 'No account fetcher specified',
      })
    const accountClient = createAccountClient(fetchers.accountFetcher, {
      ...generateTraceContextHeaders(traceSpan),
    })
    const accountAddresses =
      (
        await accountClient.getAddresses.query({
          account: accountUrn,
        })
      )?.filter(
        (address) => address.rc.addr_type !== CryptoAddressType.Wallet
      ) || []

    for (const addressNode of accountAddresses) {
      result.connected_accounts.claims.connected_accounts.push({
        type: addressNode.rc.addr_type,
        identifier: addressNode.qc.alias,
      })
      result.connected_accounts.meta.urns.push(addressNode.baseUrn)
    }
  } else {
    //Static persona submission of addresses
    const authorizedAddresses = personaData.connected_accounts as AddressURN[]
    const edgesClient = createEdgesClient(
      fetchers.edgesFetcher,
      generateTraceContextHeaders(traceSpan)
    )

    const edgePromises = authorizedAddresses.map((address) => {
      return edgesClient.findNode.query({ baseUrn: address })
    })
    const edgeResults = await Promise.all(edgePromises)

    //Make typescript gods happy
    type connectedAddressType = { type: string; identifier: string }

    for (const addressNode of edgeResults) {
      result.connected_accounts.claims.connected_accounts.push({
        type: addressNode.rc.addr_type,
        identifier: addressNode.qc.alias,
      })
      result.connected_accounts.meta.urns.push(addressNode.baseUrn)
    }
  }
  return result
}

export const scopeClaimRetrievers: Record<
  ScopeValueName,
  ScopeClaimRetrieverFunction
> = {
  profile: profileClaimsRetriever,
  email: emailClaimRetriever,
  erc_4337: erc4337ClaimsRetriever,
  connected_accounts: connectedAccountsClaimsRetriever,
}

export async function getClaimValues(
  accountUrn: AccountURN,
  clientId: string,
  scope: string[],
  env: Fetchers,
  traceSpan: TraceSpan,
  preFetchedPersonaData?: PersonaData
): Promise<ClaimData> {
  let result: ClaimData = {}

  let personaData = preFetchedPersonaData
  if (!personaData) {
    if (!env.accessFetcher)
      throw new InternalServerError({ message: 'No access fetcher specified' })
    const accessClient = createAccessClient(
      env.accessFetcher,
      generateTraceContextHeaders(traceSpan)
    )
    personaData = await accessClient.getPersonaData.query({
      accountUrn,
      clientId,
    })
  }

  const accessId = `${AccountURNSpace.decode(accountUrn)}@${clientId}`
  const accessUrn = AccessURNSpace.componentizedUrn(accessId)

  for (const scopeValue of scope) {
    const retrieverFunction = scopeClaimRetrievers[scopeValue]
    if (!retrieverFunction) continue
    try {
      const claimData = await retrieverFunction(
        scopeValue,
        accountUrn,
        clientId,
        accessUrn,
        env,
        personaData,
        traceSpan
      )
      result = { ...result, ...claimData }
    } catch (e) {
      //In cases of errors in retriever, we don't retrun any claims and we mark the object
      //as invalid. It's the responsibility of caller to handle that upstream.
      result = { ...result, ...createInvalidClaimDataObject(scopeValue) }
    }
  }
  return result
}

export const userClaimsFormatter = (
  claimData: ClaimData,
  includeScopeValues?: string[]
): ClaimValuePairs => {
  let result: ClaimValuePairs = {}
  for (const scopeEntry of Object.keys(claimData)) {
    if (includeScopeValues) {
      if (includeScopeValues.includes(scopeEntry))
        result = { ...result, ...claimData[scopeEntry].claims }
      else continue
    } else {
      result = { ...result, ...claimData[scopeEntry].claims }
    }
  }
  return result
}
