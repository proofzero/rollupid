import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import {
  IdentityGroupURNValidator,
  IdentityURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { InternalServerError } from '@proofzero/errors'

export const DeleteIdentityGroupMembershipInputSchema = z.object({
  identityURN: IdentityURNInput,
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

  const { identityGroupURN, identityURN } = input

  const { edges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })

  const ownEdge = edges.find((edge) => edge.src.baseUrn === ctx.identityURN)
  if (!ownEdge) {
    throw new InternalServerError({
      message: 'Requesting account is not part of group',
    })
  }

  if (edges.length === 1) {
    throw new InternalServerError({
      message:
        'Cannot delete the last membership of an identity group. You can try to delete the entire group.',
    })
  }

  const targetEdge = edges.find((edge) => edge.src.baseUrn === identityURN)
  if (!targetEdge) {
    throw new InternalServerError({
      message: 'Target account is not part of group',
    })
  }

  await caller.edges.removeEdge({
    src: identityURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })
}
