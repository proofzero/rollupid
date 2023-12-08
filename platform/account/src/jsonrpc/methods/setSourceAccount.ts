import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EmailAccountType } from '@proofzero/types/account'
import { parseUrnForEdge } from '@proofzero/urns/edge'

import { node } from '@proofzero/platform.edges/src/db/insert'

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
  if (!ctx.accountURN)
    throw new BadRequestError({ message: 'missing account urn' })

  await ctx.graph.db.batch(node(ctx.graph, parseUrnForEdge(ctx.accountURN)))

  const type = await ctx.account.class.getType()
  if (type !== EmailAccountType.Mask)
    throw new BadRequestError({
      message: `invalid account type: ${type}`,
    })

  const email = new EmailAccount(ctx.account, ctx.env)
  return email.setSourceAccount(input)
}
