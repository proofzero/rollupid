import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { InternalServerError } from '@proofzero/errors'

export const DeleteIdentityGroupMembershipInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type DeleteIdentityGroupMembershipInput = z.infer<
  typeof DeleteIdentityGroupMembershipInputSchema
>

export const deleteIdentityGroupMembership = async ({
  input,
  ctx,
}: {
  input: DeleteIdentityGroupMembershipInput
  ctx: Context
}): Promise<void> => {
  const caller = router.createCaller(ctx)

  if (!ctx.accountURN) {
    throw new InternalServerError({
      message:
        'Account URN is not set in context. Make sure you are using the proper middleware.',
    })
  }

  const { identityGroupURN } = input

  const { edges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })

  if (edges.length === 1) {
    throw new InternalServerError({
      message: 'Cannot delete the last membership of an identity group.',
    })
  }

  await caller.edges.removeEdge({
    src: ctx.accountURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })
}
