import createEdgesClient from '@kubelt/platform-clients/edges'
import type { AccessURN } from '@kubelt/urns/access'
import { Context } from '../../context'
import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'
import { Graph } from '@kubelt/types'
import { inputValidators } from '@kubelt/platform-middleware'
import { z } from 'zod'

// Input
// -----------------------------------------------------------------------------

export const GetSessionsMethodInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type GetSessionsParams = z.infer<typeof GetSessionsMethodInput>

// Output
// -----------------------------------------------------------------------------

export const GetSessionsMethodOutput = z.array(inputValidators.AccessURNInput)

// Method
// -----------------------------------------------------------------------------

export const getSessionsMethod = async ({
  input,
  ctx,
}: {
  input: GetSessionsParams
  ctx: Context
}) => {
  const edgesClient = createEdgesClient(ctx.Edges)

  // Only the subject of supplied JWT can get sessions; the input
  // account parameter and header JWT 'sub' must match.
  if (input.account !== ctx.accountURN) {
    throw new Error(`input account and JWT account do not match`)
  }

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      // We only want edges that start at the provided account node.
      id: input.account,
      // We only want edges that link to Access nodes (sessions).
      tag: EDGE_ACCESS,
      // Account -> Access edges indicate session ownership.
      dir: Graph.EdgeDirection.Outgoing,
    },
  })

  // Returns a list of Access node URNs.
  return edgesResult.edges.map((edge) => {
    return edge.dst.urn as AccessURN
  })
}
