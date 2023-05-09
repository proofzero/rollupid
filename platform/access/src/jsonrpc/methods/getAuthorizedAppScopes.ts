import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@proofzero/platform-middleware'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AuthorizationControlSelection } from '@proofzero/types/application'
import { AddressURN } from '@proofzero/urns/address'
import { AccessURNSpace } from '@proofzero/urns/access'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { appRouter } from '../router'

export const GetAuthorizedAppScopesMethodInput = z.object({
  accountURN: inputValidators.AccountURNInput,
  clientId: z.string().min(1),
})
type GetAuthorizedAppScopesMethodParams = z.infer<
  typeof GetAuthorizedAppScopesMethodInput
>

export const GetAuthorizedAppScopesMethodOutput = z.object({
  email: z
    .object({
      address: z.string(),
      urn: z.string(),
    })
    .optional(),
  connected_accounts: z
    .array(
      z.object({
        type: z.string(),
        identifier: z.string(),
        urn: z.string(),
      })
    )
    .optional(),
})

export type GetAuthorizedAppScopesMethodResult = z.infer<
  typeof GetAuthorizedAppScopesMethodOutput
>

export const getAuthorizedAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAppScopesMethodParams
  ctx: Context
}): Promise<GetAuthorizedAppScopesMethodResult> => {
  const { accountURN, clientId } = input

  const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)
  const accessUrn = AccessURNSpace.componentizedUrn(name)

  const { tokenIndex, tokenMap } = await accessNode.class.getTokenState()

  const accessCaller = appRouter.createCaller(ctx)
  const personaData = await accessCaller.getPersonaData({
    accountUrn: accountURN,
    clientId,
  })

  let claims: GetAuthorizedAppScopesMethodResult = {}

  const scopes = Array.from(
    new Set(tokenIndex.flatMap((t) => tokenMap[t].scope))
  )

  for (const scope of scopes) {
    if (scope === 'email' && personaData.email) {
      const emailAddressUrn = personaData.email
      const edgesResults = await ctx.edgesClient!.getEdges.query({
        query: {
          src: { baseUrn: accessUrn },
          dst: { baseUrn: emailAddressUrn },
          tag: EDGE_HAS_REFERENCE_TO,
        },
      })
      const emailAddress = edgesResults.edges[0].dst.qc.alias
      claims = {
        ...claims,
        email: {
          address: emailAddress,
          urn: edgesResults.edges[0].dst.baseUrn,
        },
      }
    } else if (
      scope === 'connected_accounts' &&
      personaData.connected_accounts != undefined
    ) {
      if (
        personaData.connected_accounts === AuthorizationControlSelection.ALL
      ) {
        const accountAddresses = await ctx.accountClient.getAddresses.query({
          account: accountURN,
        })

        const claimResults = accountAddresses?.map((a) => {
          return {
            type: a.rc.addr_type,
            identifier: a.qc.alias,
            urn: a.baseUrn,
          }
        })

        claims = { ...claims, connected_accounts: claimResults }
      } else {
        const authorizedAddresses =
          personaData.connected_accounts as AddressURN[]
        const edgePromises = authorizedAddresses?.map((address) => {
          return ctx.edgesClient!.findNode.query({ baseUrn: address })
        })
        const edgeResults = await Promise.all(edgePromises)
        if (edgeResults.length > 0) {
          const claimResults = edgeResults.map((e) => {
            return {
              type: e.rc.addr_type,
              identifier: e.qc.alias,
              urn: e.baseUrn as string,
            }
          })

          claims = { ...claims, connected_accounts: claimResults }
        }
      }
    }
  }

  return claims
}
