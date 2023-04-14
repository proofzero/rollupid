import { AccessURN, AccessURNSpace } from '@proofzero/urns/access'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'
import createEdgesClient from '@proofzero/platform-clients/edges'
import createAddressClient from '@proofzero/platform-clients/address'
import createAccessClient from '@proofzero/platform-clients/access'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { EmailAddressType, OAuthAddressType } from '@proofzero/types/address'
import { PersonaData } from '@proofzero/types/application'

export const EDGE_AUTHORIZES_REF_TO: EdgeURN = EdgeSpace.urn('authorizes/refTo')

export async function validatePersonaData(
  accountUrn: AccountURN,
  personaData: PersonaData,
  env: { addressFetcher: Fetcher },
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
  const edgesClient = createEdgesClient(
    env.edgesFetcher,
    generateTraceContextHeaders(traceSpan)
  )
  for (const scopeEntry of scope) {
    //TODO: make this more generic so it applies to all claims
    if (scopeEntry === 'email' && personaData.email) {
      const claimAddressUrnForEmail = personaData.email as AddressURN
      const createdEdge = await edgesClient.makeEdge.mutate({
        src: accessNode,
        tag: EDGE_AUTHORIZES_REF_TO,
        dst: claimAddressUrnForEmail,
      })
    }
  }
}

export type ClaimValueType =
  | string
  | {
      [K: string]: ClaimValueType
    }

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
          tag: EDGE_AUTHORIZES_REF_TO,
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
    }
  }
  return result
}
