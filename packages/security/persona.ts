import {
  AuthorizationURN,
  AuthorizationURNSpace,
} from '@proofzero/urns/authorization'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import { PlatformAccountURNHeader } from '@proofzero/types/headers'
import {
  BadRequestError,
  InternalServerError,
  RollupError,
  UnauthorizedError,
} from '@proofzero/errors'
import {
  CryptoAccountType,
  EmailAccountType,
  OAuthAccountType,
} from '@proofzero/types/account'
import {
  AuthorizationControlSelection,
  PersonaData,
} from '@proofzero/types/application'
import { AnyURN } from '@proofzero/urns'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { NO_OP_ACCOUNT_PLACEHOLDER } from '@proofzero/platform.account/src/constants'
import createCoreClient from '@proofzero/platform-clients/core'

export async function validatePersonaData(
  identityURN: IdentityURN,
  personaData: PersonaData,
  coreFetcher: Fetcher,
  traceSpan: TraceSpan
): Promise<void> {
  //If there's nothing to validate, return right away
  if (!personaData) return

  for (const [scopeName, claimValue] of Object.entries(personaData)) {
    //TODO: Make this more generic to apply to any claims
    if (scopeName === 'email') {
      const accountUrnForEmail = claimValue
      if (!AccountURNSpace.is(accountUrnForEmail))
        throw new BadRequestError({
          message: 'Bad data received for account identifier',
        })

      const coreClient = createCoreClient(coreFetcher, {
        [PlatformAccountURNHeader]: accountUrnForEmail,
        ...generateTraceContextHeaders(traceSpan),
      })
      const retrievedIdentityUrn = await coreClient.account.getIdentity.query()

      if (retrievedIdentityUrn !== identityURN)
        throw new BadRequestError({
          message: 'Account provided does not belong to authenticated identity',
        })

      const accountProfile = await coreClient.account.getAccountProfile.query()
      if (
        accountProfile.type !== OAuthAccountType.Google &&
        accountProfile.type !== OAuthAccountType.Microsoft &&
        accountProfile.type !== OAuthAccountType.Apple &&
        accountProfile.type !== EmailAccountType.Email
      )
        throw new BadRequestError({
          message: 'Account provided is not an email-compatible account',
        })
    } else if (['connected_accounts', 'erc_4337'].includes(scopeName)) {
      const authorizedAccountUrns = claimValue

      //If user selection is ALL, there's nothing further to validate
      if (claimValue === AuthorizationControlSelection.ALL) continue

      //If user selection is not ALL, check expected data type in personaData, ie. AccountURN[]
      if (
        !(
          authorizedAccountUrns &&
          Array.isArray(authorizedAccountUrns) &&
          authorizedAccountUrns.every((e) => AccountURNSpace.is(e))
        )
      ) {
        throw new BadRequestError({
          message: 'Bad data received for list of account identifiers',
        })
      }

      const coreClient = createCoreClient(coreFetcher, {
        ...generateTraceContextHeaders(traceSpan),
      })
      const identityAccounts = await coreClient.identity.getAccounts.query({
        identity: identityURN,
      })

      const ownedAccountURNList =
        identityAccounts?.map((aa) => aa.baseUrn) || []

      //Check if authorized account set is fully owned by the identity doing the authorization
      if (
        !identityAccounts ||
        !authorizedAccountUrns.every((accountURN) =>
          ownedAccountURNList.includes(accountURN)
        )
      ) {
        throw new UnauthorizedError({
          message:
            'Mismatch in accounts provided vs accounts connected to identity',
        })
      }
    }
  }
}

/* Sets authorization references to other nodes in the graph. Assumes that
 * validation has been executed and trusts validity of data being passed in */
export async function setPersonaReferences(
  authorizationNode: AuthorizationURN,
  scope: string[],
  personaData: PersonaData,
  coreFetcher: Fetcher,
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
      Array.isArray(personaData.connected_accounts)
    ) {
      //This (correctly) gets skipped when personaData value of
      //connected_accounts is set to ALL
      personaData.connected_accounts.forEach((accountUrn) =>
        uniqueAuthorizationReferences.add(accountUrn)
      )
    } else if (
      scopeEntry === 'erc_4337' &&
      personaData.erc_4337 &&
      Array.isArray(personaData.erc_4337)
    ) {
      //This (correctly) gets skipped when personaData value of
      //erc_4337 is set to ALL
      personaData.erc_4337.forEach((accountUrn) =>
        uniqueAuthorizationReferences.add(accountUrn)
      )
    }
  }

  const coreClient = createCoreClient(
    coreFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  //TODO: The next set of 3 operations will need to be optmizied into a single
  //SQL transaction

  //Get existing references
  const edgesToDelete = await coreClient.edges.getEdges.query({
    query: { tag: EDGE_HAS_REFERENCE_TO, src: { baseUrn: authorizationNode } },
  })

  //Delete existing references
  edgesToDelete.edges.forEach(
    async (edge) =>
      await coreClient.edges.removeEdge.mutate({
        tag: edge.tag,
        dst: edge.dst.baseUrn,
        src: edge.src.baseUrn,
      })
  )

  //Add new references
  const edges = await Promise.allSettled(
    [...uniqueAuthorizationReferences].map((refUrn) => {
      //This returns promises that get awaited collectively above
      return coreClient.edges.makeEdge.mutate({
        src: authorizationNode,
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

export type ScopeClaimRetrieverFunction = (
  scopeEntry: ScopeValueName,
  identityURN: IdentityURN,
  clientId: string,
  authorizationUrn: AuthorizationURN,
  coreFetcher: Fetcher,
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
  identityURN: IdentityURN,
  clientId: string,
  authorizationUrn: AuthorizationURN,
  coreFetcher: Fetcher,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  const coreClient = createCoreClient(
    coreFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  if (personaData.email) {
    const emailAccountUrn = personaData.email
    const edgesResults = await coreClient.edges.getEdges.query({
      query: {
        src: { baseUrn: authorizationUrn },
        dst: { baseUrn: emailAccountUrn },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })
    const emailAccount = edgesResults.edges[0].dst.qc.alias
    const claimData: ClaimData = {
      [scopeEntry]: {
        claims: {
          email: emailAccount,
        },
        meta: {
          urns: [emailAccountUrn],
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
  identityURN: IdentityURN,
  clientId: string,
  authorizationUrn: AuthorizationURN,
  coreFetcher: Fetcher,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
  const coreClient = createCoreClient(
    coreFetcher,
    generateTraceContextHeaders(traceSpan)
  )
  const nodeResult = await coreClient.edges.findNode.query({
    baseUrn: identityURN,
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
  identityURN: IdentityURN,
  clientId: string,
  authorizationUrn: AuthorizationURN,
  coreFetcher: Fetcher,
  personaData: PersonaData,
  traceSpan: TraceSpan
): Promise<ClaimData> {
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

  const coreClient = createCoreClient(
    coreFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  if (personaData.erc_4337 === AuthorizationControlSelection.ALL) {
    //Referencable persona submission pointing to all connected sc wallets
    //at any point in time
    const identityAccounts =
      (
        await coreClient.identity.getAccounts.query({
          identity: identityURN,
        })
      )?.filter(
        (account) => account.rc.addr_type === CryptoAccountType.Wallet
      ) || []

    for (const accountNode of identityAccounts) {
      result.erc_4337.claims.erc_4337.push({
        type: accountNode.rc.addr_type,
        identifier: accountNode.qc.alias,
      })
      result.erc_4337.meta.urns.push(accountNode.baseUrn)
    }
  } else {
    const walletAccountUrns = personaData.erc_4337 as AccountURN[]

    const coreClient = createCoreClient(
      coreFetcher,
      generateTraceContextHeaders(traceSpan)
    )
    const accountProfiles =
      await coreClient.account.getAccountProfileBatch.query(walletAccountUrns)

    accountProfiles.forEach((profile, idx) => {
      result.erc_4337.claims.erc_4337.push({
        nickname: profile.title,
        address: profile.address,
      })
      result.erc_4337.meta.urns.push(walletAccountUrns[idx])
    })
  }
  return result
}

async function connectedAccountsClaimsRetriever(
  scopeEntry: ScopeValueName,
  identityURN: IdentityURN,
  clientId: string,
  authorizationUrn: AuthorizationURN,
  coreFetcher: Fetcher,
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

  const coreClient = createCoreClient(
    coreFetcher,
    generateTraceContextHeaders(traceSpan)
  )

  if (personaData.connected_accounts === AuthorizationControlSelection.ALL) {
    //Referencable persona submission pointing to all connected accounts
    //at any point in time
    const identityAccounts =
      (
        await coreClient.identity.getAccounts.query({
          identity: identityURN,
        })
      )?.filter(
        (account) => account.rc.addr_type !== CryptoAccountType.Wallet
      ) || []

    for (const accountNode of identityAccounts) {
      result.connected_accounts.claims.connected_accounts.push({
        type: accountNode.rc.addr_type,
        identifier: accountNode.qc.alias,
      })
      result.connected_accounts.meta.urns.push(accountNode.baseUrn)
    }
  } else {
    //Static persona submission of accounts
    const authorizedAccounts = personaData.connected_accounts as AccountURN[]

    const nodeQueries = authorizedAccounts.map((account) => ({
      baseUrn: account,
    }))
    const nodeResults = await coreClient.edges.findNodeBatch.query(nodeQueries)

    nodeResults.forEach((accountNode, i) => {
      if (!accountNode)
        throw new InternalServerError({
          message: `Did not find result for node ${authorizedAccounts[i]}`,
        })
      result.connected_accounts.claims.connected_accounts.push({
        type: accountNode.rc.addr_type,
        identifier: accountNode.qc.alias,
      })
      result.connected_accounts.meta.urns.push(accountNode.baseUrn)
    })
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
  identityURN: IdentityURN,
  clientId: string,
  scope: string[],
  coreFetcher: Fetcher,
  traceSpan: TraceSpan,
  preFetchedPersonaData?: PersonaData
): Promise<ClaimData> {
  let result: ClaimData = {}

  let personaData = preFetchedPersonaData
  if (!personaData) {
    const coreClient = createCoreClient(
      coreFetcher,
      generateTraceContextHeaders(traceSpan)
    )
    personaData = await coreClient.authorization.getPersonaData.query({
      identityURN,
      clientId,
    })
  }

  const authorizationId = `${IdentityURNSpace.decode(identityURN)}@${clientId}`
  const authorizationUrn =
    AuthorizationURNSpace.componentizedUrn(authorizationId)

  const retrieverPromises = scope.map((scopeValue) => {
    const retrieverFunction = scopeClaimRetrievers[scopeValue]
    if (!retrieverFunction) return
    else
      return retrieverFunction(
        scopeValue,
        identityURN,
        clientId,
        authorizationUrn,
        coreFetcher,
        personaData || {},
        traceSpan
      )
  })

  const retrieverResults = await Promise.allSettled(retrieverPromises)
  retrieverResults
    .map((r, idx) =>
      //In cases of errors in retriever, we don't retrun any claims and we mark the object
      //as invalid. It's the responsibility of caller to handle that upstream.
      r.status === 'fulfilled'
        ? r.value
        : createInvalidClaimDataObject(scope[idx])
    )
    .forEach((claimData) => (result = { ...result, ...claimData }))
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
