import { z } from 'zod'
import {
  IdentityGroupURNValidator,
  IdentityURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'

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

  const DO = initIdentityGroupNodeByName(
    input.identityGroupURN,
    ctx.IdentityGroup
  )
  const { error } = await DO.class.validateAdmin(input.identityURN)

  return {
    read: edges.length > 0,
    write: !error,
  }
}
