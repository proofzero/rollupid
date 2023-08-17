import { z } from 'zod'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'

export const IsMemberOfAnyGroupInputSchema = z.object({
  identityURN: IdentityURNInput,
})
export type IsMemberOfAnyGroupInput = z.infer<
  typeof IsMemberOfAnyGroupInputSchema
>

export const IsMemberOfAnyGroupOutputSchema = z.boolean()
export type IsMemberOfAnyGroupOutput = z.infer<
  typeof IsMemberOfAnyGroupOutputSchema
>

export const isMemberOfAnyGroup = async ({
  input,
  ctx,
}: {
  input: IsMemberOfAnyGroupInput
  ctx: Context
}): Promise<IsMemberOfAnyGroupOutput> => {
  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: input.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  return edges.length > 0
}
