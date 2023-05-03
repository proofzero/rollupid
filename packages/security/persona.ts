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
    } else if (scopeName === 'connected_accounts') {
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

export async function getClaimValues(
  accountUrn: AccountURN,
  clientId: string,
  scope: string[],
  env: {
    accountFetcher?: Fetcher
    accessFetcher?: Fetcher
    edgesFetcher: Fetcher
  },
  traceSpan: TraceSpan,
  preFetchedPersonaData?: PersonaData
): Promise<Record<string, ClaimValueType>> {
  let result: Record<string, ClaimValueType> = {}

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

  const edgesClient = createEdgesClient(
    env.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )
  for (const scopeValue of scope) {
    if (scopeValue === 'email' && personaData.email) {
      const emailAddressUrn = personaData.email
      const edgesResults = await edgesClient.getEdges.query({
        query: {
          src: { baseUrn: accessUrn },
          dst: { baseUrn: emailAddressUrn },
          tag: EDGE_HAS_REFERENCE_TO,
        },
      })
      const emailAddress = edgesResults.edges[0].dst.qc.alias
      result = { ...result, email: emailAddress }
    } else if (scopeValue === 'profile') {
      const nodeResult = await edgesClient.findNode.query({
        baseUrn: accountUrn,
      })
      if (nodeResult) {
        result = {
          ...result,
          name: nodeResult.qc.name,
          picture: nodeResult.qc.picture,
        }
      }
    } else if (scopeValue === 'erc_4337') {
      result = {
        ...result,
        [scopeValue]: personaData.erc_4337,
      }
    } else if (scopeValue === 'connected_accounts') {
      if (
        personaData.connected_accounts === AuthorizationControlSelection.ALL
      ) {
        //Referencable persona submission pointing to all connected addresses
        //at any point in time
        if (!env.accountFetcher)
          throw new InternalServerError({
            message: 'No account fetcher specified',
          })
        const accountClient = createAccountClient(env.accountFetcher, {
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

        const claimResults = accountAddresses.map((a) => {
          return { type: a.rc.addr_type, identifier: a.qc.alias }
        })
        result = { ...result, connected_accounts: claimResults }
      } else {
        //Static persona submission of addresses
        const authorizedAddresses =
          personaData.connected_accounts as AddressURN[]
        const edgePromises = authorizedAddresses.map((address) => {
          return edgesClient.findNode.query({ baseUrn: address })
        })
        const edgeResults = await Promise.allSettled(edgePromises)

        //Make typescript gods happy
        type connectedAddressType = { type: string; identifier: string }
        const isDefined = (
          optionallyDefined: connectedAddressType | undefined
        ): optionallyDefined is connectedAddressType => !!optionallyDefined

        const claimResults = edgeResults
          .map((e) => {
            if (e.status === 'fulfilled')
              return {
                type: e.value.rc.addr_type,
                identifier: e.value.qc.alias,
              }
          })
          .filter(isDefined)
        result = { ...result, connected_accounts: claimResults }
      }
    }
  }
  return result
}

export async function getKeyedClaimValues(
  accountUrn: AccountURN,
  clientId: string,
  scope: string[],
  env: {
    accountFetcher?: Fetcher
    accessFetcher?: Fetcher
    edgesFetcher: Fetcher
  },
  traceSpan: TraceSpan,
  preFetchedPersonaData?: PersonaData
): Promise<Record<string, ClaimValueType>> {
  let result: Record<string, ClaimValueType> = {}

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

  const edgesClient = createEdgesClient(
    env.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )
  for (const scopeValue of scope) {
    if (scopeValue === 'email' && personaData.email) {
      const emailAddressUrn = personaData.email
      const edgesResults = await edgesClient.getEdges.query({
        query: {
          src: { baseUrn: accessUrn },
          dst: { baseUrn: emailAddressUrn },
          tag: EDGE_HAS_REFERENCE_TO,
        },
      })
      const emailAddress = edgesResults.edges[0].dst.qc.alias
      result = {
        ...result,
        email: {
          address: emailAddress,
          urn: edgesResults.edges[0].dst.baseUrn,
        },
      }
    } else if (scopeValue === 'profile') {
      const nodeResult = await edgesClient.findNode.query({
        baseUrn: accountUrn,
      })
      if (nodeResult) {
        result = {
          ...result,
          profile: {
            name: nodeResult.qc.name,
            picture: nodeResult.qc.picture,
            urn: nodeResult.baseUrn,
          },
        }
      }
    } else if (scopeValue === 'connected_accounts') {
      if (
        personaData.connected_accounts === AuthorizationControlSelection.ALL
      ) {
        //Referencable persona submission pointing to all connected addresses
        //at any point in time
        if (!env.accountFetcher)
          throw new InternalServerError({
            message: 'No account fetcher specified',
          })
        const accountClient = createAccountClient(env.accountFetcher, {
          ...generateTraceContextHeaders(traceSpan),
        })
        const accountAddresses =
          (await accountClient.getAddresses.query({
            account: accountUrn,
          })) || []

        const claimResults = accountAddresses.map((a) => {
          return {
            type: a.rc.addr_type,
            identifier: a.qc.alias,
            urn: a.baseUrn,
          }
        })
        result = { ...result, connected_accounts: claimResults }
      } else {
        //Static persona submission of addresses
        const authorizedAddresses =
          personaData.connected_accounts as AddressURN[]
        const edgePromises = authorizedAddresses.map((address) => {
          return edgesClient.findNode.query({ baseUrn: address })
        })
        const edgeResults = await Promise.allSettled(edgePromises)

        //Make typescript gods happy
        type connectedAddressType = { type: string; alias: string; urn: string }
        const isDefined = (
          optionallyDefined: connectedAddressType | undefined
        ): optionallyDefined is connectedAddressType => !!optionallyDefined

        const claimResults = edgeResults
          .map((e) => {
            if (e.status === 'fulfilled')
              return {
                type: e.value.rc.addr_type,
                alias: e.value.qc.alias,
                urn: e.value.baseUrn as string,
              }
          })
          .filter(isDefined)

        result = { ...result, connected_accounts: claimResults }
      }
    }
  }
  return result
}
