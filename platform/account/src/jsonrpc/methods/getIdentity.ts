import { z } from 'zod'

import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'

import { isHandleAccountType } from '../../utils'

export const GetIdentityInput = z.void()
type GetIdentityInput = z.infer<typeof GetIdentityInput>

export const GetIdentityOutput = IdentityURNInput.optional()
type GetIdentityResult = z.infer<typeof GetIdentityOutput>

type GetIdentityParams = {
  input: GetIdentityInput
  ctx: Context
}

interface GetIdentityMethod {
  (params: GetIdentityParams): Promise<GetIdentityResult>
}

export const getIdentityMethod: GetIdentityMethod = async ({ input, ctx }) => {
  if (isHandleAccountType(ctx.addrType as string)) {
    throw new Error('Not implemented')
  }

  const nodeClient = ctx.account
  const identity = await nodeClient?.class.getIdentity()
  return identity
}
