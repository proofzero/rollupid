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
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '@proofzero/errors'
import { EmailAddressType, OAuthAddressType } from '@proofzero/types/address'
import { PersonaData } from '@proofzero/types/application'
import { AnyURN } from '@proofzero/urns'

export const EDGE_HAS_REFERENCE_TO: EdgeURN = EdgeSpace.urn('has/refTo')

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
    } else if (scopeName === 'connected_addresses') {
      const authorizedAddressUrns = claimValue

      //Check expected data type in personaData, ie. AddressURN[]
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

      //Check if authorized address set is fully owned by the account doing the authorization
      if (
        !accountAddresses ||
        !accountAddresses.every((e) =>
          authorizedAddressUrns.includes(e.baseUrn as AddressURN)
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
      scopeEntry === 'connected_addresses' &&
      personaData.connected_addresses &&
      personaData.connected_addresses instanceof Array
    ) {
      personaData.connected_addresses.forEach((addressUrn) =>
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
    } else if (scopeValue === 'connected_addresses') {
      const authorizedAddresses =
        personaData.connected_addresses as AddressURN[]
      const edgePromises = authorizedAddresses.map((address) => {
        return edgesClient.findNode.query({ baseUrn: address })
      })
      const edgeResults = await Promise.allSettled(edgePromises)

      //Make typescript gods happy
      type connectedAddressType = { type: string; alias: string }
      const isDefined = (
        optionallyDefined: connectedAddressType | undefined
      ): optionallyDefined is connectedAddressType => !!optionallyDefined

      const claimResults = edgeResults
        .map((e) => {
          if (e.status === 'fulfilled')
            return { type: e.value.rc.addr_type, alias: e.value.qc.alias }
        })
        .filter(isDefined)
      result = { ...result, connected_addresses: claimResults }
    }
  }
  return result
}
