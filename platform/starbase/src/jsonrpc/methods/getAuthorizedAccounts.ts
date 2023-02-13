import createEdgesClient from '@kubelt/platform-clients/edges'
import type { AccessRComp } from '@kubelt/urns/access'
import { Context } from '../context'
import { EDGE_AUTHORIZES } from '@kubelt/platform.access/src/constants'
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
    accountURN: z.string(),
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

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      tag: EDGE_AUTHORIZES,
    },
    // set limit to not query the whole db
    opt: { limit: 8 },
  })

  const mappedEdges = edgesResult.edges
    .filter(
      (edge, index, edges) =>
        (edge.dst.rc as AccessRComp) &&
        (edge.dst.rc as AccessRComp).client_id &&
        (edge.dst.rc as AccessRComp).client_id === input.client &&
        // take only 1 entry by accountURN
        edges.findIndex(
          (me) =>
            // check that the app is the current app
            (me.dst.rc as AccessRComp).client_id === input.client &&
            // check that accountURN is the needed one
            me.src.id === edge.src.id
        ) === index
    )
    .map((edge) => {
      const timestamp = new Date(
        (edge.createdTimestamp as string) + ' UTC'
      ).getTime()
      const accountURN = edge.src.urn
      return { accountURN, timestamp }
    })
    // Order in ascending order
    .sort((a, b) => a.timestamp - b.timestamp)
    // Take only 8 entries
    .slice(0, 8)

  console.log({ mappedEdges })

  return mappedEdges
}
