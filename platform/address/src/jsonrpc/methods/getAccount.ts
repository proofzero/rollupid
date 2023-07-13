import { z } from 'zod'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { isHandleAddressType } from '../../utils'

export const GetAccountInput = z.void()
type GetAccountInput = z.infer<typeof GetAccountInput>

export const GetAccountOutput = AccountURNInput.optional()
type GetAccountResult = z.infer<typeof GetAccountOutput>

type GetAccountParams = {
  input: GetAccountInput
  ctx: Context
}

interface GetAccountMethod {
  (params: GetAccountParams): Promise<GetAccountResult>
}

export const getAccountMethod: GetAccountMethod = async ({ input, ctx }) => {
  if (isHandleAddressType(ctx.addrType as string)) {
    throw new Error('Not implemented')
  }

  const nodeClient = ctx.address
  const account = await nodeClient?.class.getAccount()
  return account
}
