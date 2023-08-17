import { z } from 'zod'
import {
  IdentityGroupURNValidator,
  IdentityURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'

export const HasIdentityGroupAuthorizationInputSchema = z.object({
  identityURN: IdentityURNInput,
  identityGroupURN: IdentityGroupURNValidator,
})
export type HasIdentityGroupAuthorizationInput = z.infer<
  typeof HasIdentityGroupAuthorizationInputSchema
>

export const HasIdentityGroupAuthorizationOutputSchema = z.boolean()
export type HasIdentityGroupAuthorizationOutput = z.infer<
  typeof HasIdentityGroupAuthorizationOutputSchema
>

export const hasIdentityGroupAuthorization = async ({
  input,
  ctx,
}: {
  input: HasIdentityGroupAuthorizationInput
  ctx: Context
}): Promise<HasIdentityGroupAuthorizationOutput> => {
  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: input.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: input.identityGroupURN,
      },
    },
  })

  return edges.length > 0
}
