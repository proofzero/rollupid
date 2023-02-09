import createEdgesClient from '@kubelt/platform-clients/edges'
import { AccessRComp, AccessURNSpace } from '@kubelt/urns/access'
import { Context } from '../context'
import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'
// import { Graph } from '@kubelt/types'
// import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

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
    clientId: z.string(),
    timestamp: z.number(),
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

  // Only the subject of supplied JWT can get sessions; the input
  // account parameter and header JWT 'sub' must match.
  //   if (input.client !== ctx.accountURN) {
  //     throw new Error(`input account and JWT account do not match`)
  //   }

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      tag: EDGE_ACCESS,
      // Account -> Access edges indicate session ownership.
      dst: { rc: input.client },
    },
  })

  console.log({ edgesResult })

  const mappedEdges = edgesResult.edges
    //     // Map for easy type definitions
    //     // and comparisons
    .map((edge) => ({
      rc: edge.dst.rc as AccessRComp,
      // The UTC addon lets the Date engine know we're
      // parsing from UTC so the locale of the client
      // is properly inferred in later usages
      timestamp: new Date((edge.createdTimestamp as string) + ' UTC').getTime(),
    }))
    // There are some edges without client_id
    // this shouldn't be the case once EDGE_AUTHORIZATION
    // is in place
    .filter((mappedEdge) => mappedEdge.rc.client_id)
    // Flatten structure
    .map((mappedEdge) => {
      const { timestamp } = mappedEdge
      const { client_id } = mappedEdge.rc

      return {
        clientId: client_id as string,
        timestamp,
      }
    })
    // Order in ascending order
    .sort((a, b) => a.timestamp - b.timestamp)
    // Take only the first entry per clientId
    .filter(
      (val, ind, self) =>
        self.findIndex((me) => me.clientId === val.clientId) === ind
    )

  // Results in the initial authorization for each
  // clientId
  return mappedEdges
}
