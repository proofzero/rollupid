import { z } from 'zod'

import { UnauthorizedError } from '@proofzero/errors'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'

import { Context } from '../../context'

export const DeleteAccountNodeInput = z.object({
  account: inputValidators.AccountURNInput,
})

export type DeleteAccountNodeParams = z.infer<typeof DeleteAccountNodeInput>

export const deleteAccountNodeMethod = async ({
  input,
  ctx,
}: {
  input: DeleteAccountNodeParams
  ctx: Context
}) => {
  if (ctx.accountURN !== input.account) throw new UnauthorizedError()

  const caller = router.createCaller(ctx)
  await caller.edges.deleteNode({ urn: input.account })
  await ctx.accountNode?.storage.deleteAll()

  return null
}
