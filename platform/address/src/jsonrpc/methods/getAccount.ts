import { z } from 'zod'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { Context } from '../../context'
import { isHandleAddressType } from '../../utils'

export const GetAccountOutput = AccountURNInput.optional()

type GetAccountResult = z.infer<typeof GetAccountOutput>

export const getAccountMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}): Promise<GetAccountResult> => {
  console.log('getAccountMethod', ctx.address)
  if (isHandleAddressType(ctx.addrType as string)) {
    throw new Error('Not implemented')
  }

  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()
  console.log('get account', { account })
  return account
}
