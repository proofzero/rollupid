import { z } from 'zod'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { BadRequestError } from '@proofzero/errors'
import { EmailAccountType } from '@proofzero/types/account'

import { Context } from '../../context'
import EmailAccount from '../../nodes/email'

export const GetSourceAccountInput = z.void()
export const GetSourceAccountOutput = AccountURNInput.optional()

type GetSourceAccountInput = z.infer<typeof GetSourceAccountInput>
type GetSourceAccountOutput = z.infer<typeof GetSourceAccountOutput>

type GetSourceAccountParams = {
  ctx: Context
  input: GetSourceAccountInput
}

interface GetSourceAccountMethod {
  (params: GetSourceAccountParams): Promise<GetSourceAccountOutput>
}

export const getSourceAccountMethod: GetSourceAccountMethod = async ({
  ctx,
}) => {
  if (!ctx.account) throw new BadRequestError({ message: 'missing account' })

  const type = await ctx.account.class.getType()
  if (type !== EmailAccountType.Mask) return

  const email = new EmailAccount(ctx.account, ctx.env)
  return email.getSourceAccount()
}
