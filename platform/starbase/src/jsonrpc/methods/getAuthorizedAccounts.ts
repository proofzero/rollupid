import createEdgesClient from '@kubelt/platform-clients/edges'
import { Context } from '../context'
import { EDGE_AUTHORIZES } from '@kubelt/platform.access/src/constants'

import type { AccountURN } from '@kubelt/urns/account'

import { z } from 'zod'
import { EdgesMetadata } from '@kubelt/platform/edges/src/jsonrpc/validators/edge'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodInput = z.object({
  client: z.string(),
  opt: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
})

export type GetAuthorizedAccountsParams = z.infer<
  typeof GetAuthorizedAccountsMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const AuthorizedUser = z.object({
  accountURN: AccountURNInput,
  timestamp: z.number(),
  name: z.string(),
  imageURL: z.string(),
})

export const GetAuthorizedAccountsMethodOutput = z.object({
  accounts: z.array(AuthorizedUser),
  metadata: EdgesMetadata,
})

// Method
// -----------------------------------------------------------------------------

export const getAuthorizedAccounts = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAccountsParams
  ctx: Context
}) => {
  const edgesResult = await ctx.edges.getEdges.query({
    query: {
      tag: EDGE_AUTHORIZES,
      dst: {
        rc: {
          client_id: input.client,
        },
      },
    },
    // set limit to not query the whole db
    opt: input.opt,
  })

  const mappedEdges = edgesResult?.edges.map((edge) => {
    const timestamp = new Date(
      (edge.createdTimestamp as string) + ' UTC'
    ).getTime()

    const accountURN = edge.src.baseUrn as AccountURN

    return {
      accountURN,
      timestamp,
      name: edge.src.qc.name,
      imageURL: edge.src.qc.picture,
    }
  })

  return { accounts: mappedEdges, metadata: edgesResult.metadata }
}
