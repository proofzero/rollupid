import { z } from 'zod'
import { AccountURN } from '@kubelt/urns/account'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'

export type GetProfileParams = {
  account: AccountURN
}

export const GetProfileInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const getProfileMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileParams
  ctx: Context
}) => {
  const nodeId = ctx.Account.idFromName(input.account)
  const account = await ctx.Account.get(nodeId)
  const profile = ctx.Account.get(input.account).getProfile()
  return profile
}
