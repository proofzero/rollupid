import { z } from 'zod'

import { UnauthorizedError } from '@proofzero/errors'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'

import { Context } from '../../context'

export const DeleteIdentityNodeInput = z.object({
  identity: inputValidators.IdentityURNInput,
})

export type DeleteIdentityNodeParams = z.infer<typeof DeleteIdentityNodeInput>

export const deleteIdentityNodeMethod = async ({
  input,
  ctx,
}: {
  input: DeleteIdentityNodeParams
  ctx: Context
}) => {
  if (ctx.identityURN !== input.identity) throw new UnauthorizedError()

  const caller = router.createCaller(ctx)
  await caller.edges.deleteNode({ urn: input.identity })
  await ctx.identityNode?.storage.deleteAll()

  return null
}
