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
  const profile = ctx.node.getProfile()
  return profile
}
