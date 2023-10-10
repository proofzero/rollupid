import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EmailAccountType, OAuthAccountType } from '@proofzero/types/account'

import { Context } from '../../context'
import EmailAccount from '../../nodes/email'

export const SetSourceAccountInput = AccountURNInput
export const SetSourceAccountOutput = z.void()

type SetSourceAccountInput = z.infer<typeof SetSourceAccountInput>
type SetSourceAccountOutput = z.infer<typeof SetSourceAccountOutput>

type SetSourceAccountParams = {
  ctx: Context
  input: SetSourceAccountInput
}

interface SetSourceAccountMethod {
  (params: SetSourceAccountParams): Promise<SetSourceAccountOutput>
}

export const setSourceAccountMethod: SetSourceAccountMethod = async ({
  ctx,
  input,
}) => {
  if (!ctx.account) throw new BadRequestError({ message: 'missing account' })

  const accountType = await ctx.account.class.getType()
  switch (accountType) {
    case EmailAccountType.Mask:
      break
    default:
      throw new BadRequestError({
        message: `invalid account type: ${accountType}`,
      })
  }

  const node = new EmailAccount(ctx.account, ctx.env)
  return node.setSourceAccount(input)
}
