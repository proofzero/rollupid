import { z } from 'zod'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccountURN } from '@kubelt/urns/account'
import { Context } from '../../context'

export const GetAccountOutput = AccountURNInput.optional()

type GetAccountResult = z.infer<typeof GetAccountOutput>

export const getAccountMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<GetAccountResult> => {
  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()
  return account
}
