import createEdgesClient from '@kubelt/platform-clients/edges'
import { AccessRComp, AccessURNSpace } from '@kubelt/urns/access'
import { Context } from '../context'
import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'
// import { Graph } from '@kubelt/types'
// import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'
import { edge } from '../../../../edges/src/db/insert'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodInput = z.object({
  client: z.string(),
})

export type GetAuthorizedAccountsParams = z.infer<
  typeof GetAuthorizedAccountsMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const GetAuthorizedAccountsMethodOutput = z.array(
  z.object({
    accountURN: z.string(),
    timestamp: z.number(),
    grantType: z.string(),
  })
)

// Method
// -----------------------------------------------------------------------------

export const getAuthorizedAccounts = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAccountsParams
  ctx: Context
}) => {
  const edgesClient = createEdgesClient(ctx.Edges)

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      tag: EDGE_ACCESS,
    },
  })

  const mappedEdges = edgesResult.edges
    .filter(
      (edge) => (edge.dst.rc as AccessRComp).client_id //&&
    )
    .map((edge) => {
      const timestamp = new Date(
        (edge.createdTimestamp as string) + ' UTC'
      ).getTime()
      const accountURN = edge.src.urn
      const grantType = (edge.dst.rc as AccessRComp).grant_type as string

      return { accountURN, timestamp, grantType }
    })
    // Order in ascending order
    .sort((a, b) => a.timestamp - b.timestamp)

  return mappedEdges
}
