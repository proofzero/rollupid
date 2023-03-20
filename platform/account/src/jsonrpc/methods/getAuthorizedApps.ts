import { UnauthorizedError } from '@proofzero/errors'
import createEdgesClient from '@proofzero/platform-clients/edges'
import type { AccessRComp } from '@proofzero/urns/access'

import { Context } from '../../context'
import { EDGE_AUTHORIZES } from '@proofzero/platform.access/src/constants'
import { inputValidators } from '@proofzero/platform-middleware'
import { z } from 'zod'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedAppsMethodInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type GetAuthorizedAppsParams = z.infer<
  typeof GetAuthorizedAppsMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const GetAuthorizedAppsMethodOutput = z.array(
  z.object({
    clientId: z.string(),
    timestamp: z.number(),
  })
)

// Method
// -----------------------------------------------------------------------------

export const getAuthorizedAppsMethod = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAppsParams
  ctx: Context
}) => {
  if (!ctx.accountURN)
    throw new UnauthorizedError({ message: 'account not found' })

  const edgesClient = createEdgesClient(ctx.Edges, {
    ...generateTraceContextHeaders(ctx.traceSpan),
  })

  const edgesResult = await edgesClient.getEdges.query({
    query: {
      // We only want edges that start at the provided account node.
      src: { baseUrn: input.account },
      // We only want edges that link to Access nodes (sessions).
      tag: EDGE_AUTHORIZES,
      // Account -> Access edges indicate session ownership.
    },
  })

  const mappedEdges = edgesResult.edges
    // Map for easy type definitions
    // and comparisons
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
        clientId: client_id,
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
