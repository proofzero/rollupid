import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { EDGE_AUTHORIZES } from '@proofzero/platform.authorization/src/constants'

import type { IdentityURN } from '@proofzero/urns/identity'

import { z } from 'zod'
import { EdgesMetadata } from '@proofzero/platform/edges/src/jsonrpc/validators/edge'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

// Input
// -----------------------------------------------------------------------------

export const GetAuthorizedIdentitiesMethodInput = z.object({
  client: z.string(),
  opt: z.object({
    offset: z.number(),
    limit: z.number(),
  }),
})

export type GetAuthorizedIdentitiesParams = z.infer<
  typeof GetAuthorizedIdentitiesMethodInput
>

// Output
// -----------------------------------------------------------------------------

export const AuthorizedUser = z.object({
  identityURN: IdentityURNInput,
  timestamp: z.number(),
  name: z.string(),
  imageURL: z.string(),
})

export const GetAuthorizedIdentitiesMethodOutput = z.object({
  identities: z.array(AuthorizedUser),
  metadata: EdgesMetadata,
})

export type GetAuthorizedIdentitiesMethodOutput = z.infer<
  typeof GetAuthorizedIdentitiesMethodOutput
>

// Method
// -----------------------------------------------------------------------------

export const getAuthorizedIdentities = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedIdentitiesParams
  ctx: Context
}): Promise<GetAuthorizedIdentitiesMethodOutput> => {
  const caller = router.createCaller(ctx)
  const edgesResult = await caller.edges.getEdges({
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

    const identityURN = edge.src.baseUrn as IdentityURN

    return {
      identityURN,
      timestamp,
      name: edge.src.qc.name || identityURN,
      imageURL: edge.src.qc.picture || '',
    }
  })

  return { identities: mappedEdges, metadata: edgesResult.metadata }
}
