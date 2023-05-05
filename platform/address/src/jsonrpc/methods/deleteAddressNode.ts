import { z } from 'zod'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { Context } from '../../context'
import { appRouter } from '../router'

export const DeleteAddressNodeInput = z.object({
  accountURN: AccountURNInput,
  purge: z.boolean().optional(),
})

type DeleteAddressNodeParams = z.infer<typeof DeleteAddressNodeInput>

export const deleteAddressNodeMethod = async ({
  input,
  ctx,
}: {
  input: DeleteAddressNodeParams
  ctx: Context
}) => {
  const caller = appRouter.createCaller({
    ...ctx,
  })

  const { accountURN, purge } = input

  // Deletes all address-account associated edges
  await caller.unsetAccount({
    accountURN,
    purge,
  })

  return await ctx.address?.storage.deleteAll()
}
