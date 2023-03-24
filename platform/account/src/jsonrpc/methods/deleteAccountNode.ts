import { z } from 'zod'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { UnauthorizedError } from '@proofzero/errors'

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
  if (ctx.accountURN === input.account) {
    await ctx.account?.storage.deleteAll()
  } else {
    throw new UnauthorizedError()
  }

  return null
}
