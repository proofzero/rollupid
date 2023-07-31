import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { inputValidators } from '@proofzero/platform-middleware'

import { Context } from '../../context'
import { AccountsSchema } from '../validators/profile'

export const GetAccountsInput = z.object({
  identity: inputValidators.IdentityURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAccountTypeInput.optional(),
    })
    .optional(),
})

export type GetAccountsParams = z.infer<typeof GetAccountsInput>

export const GetAccountsOutput = AccountsSchema.nullable()
export type GetAccountsOutputParams = z.infer<typeof GetAccountsOutput>

export const getAccountsMethod = async ({
  input,
  ctx,
}: {
  input: GetAccountsParams
  ctx: Context
}): Promise<GetAccountsOutputParams> => {
  const caller = router.createCaller(ctx)

  const getAccountsCall =
    ctx.identityURN === input.identity
      ? caller.identity.getOwnAccounts
      : caller.identity.getPublicAccounts

  const accounts = await getAccountsCall({ identity: input.identity })

  return accounts
}
