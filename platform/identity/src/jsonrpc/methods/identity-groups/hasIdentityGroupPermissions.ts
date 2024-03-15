import { z } from 'zod'
import {
  IdentityGroupURNValidator,
  IdentityURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import {
  initIdentityNodeByName,
  initIdentityGroupNodeByName,
} from '../../../nodes'

export const HasIdentityGroupPermissionsInputSchema = z.object({
  identityURN: IdentityURNInput,
  identityGroupURN: IdentityGroupURNValidator,
})
export type HasIdentityGroupPermissionsInput = z.infer<
  typeof HasIdentityGroupPermissionsInputSchema
>

export const HasIdentityGroupPermissionsOutputSchema = z.object({
  read: z.boolean(),
  write: z.boolean(),
})
export type HasIdentityGroupPermissionsOutput = z.infer<
  typeof HasIdentityGroupPermissionsOutputSchema
>

export const hasIdentityGroupPermissions = async ({
  input,
  ctx,
}: {
  input: HasIdentityGroupPermissionsInput
  ctx: Context
}): Promise<HasIdentityGroupPermissionsOutput> => {
  const caller = router.createCaller(ctx)

  const identityNode = initIdentityNodeByName(
    input.identityURN,
    ctx.env.Identity
  )
  const forwardIdentityURN = await identityNode.class.getForwardIdentityURN()
  const identityURN = forwardIdentityURN || input.identityURN

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: input.identityGroupURN,
      },
    },
  })

  const DO = initIdentityGroupNodeByName(
    input.identityGroupURN,
    ctx.env.IdentityGroup
  )
  const { error } = await DO.class.validateAdmin(identityURN)

  return {
    read: edges.length > 0,
    write: !error,
  }
}
