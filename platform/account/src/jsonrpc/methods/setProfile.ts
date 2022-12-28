import { z } from 'zod'
import { AccountURN } from '@kubelt/urns/account'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { Profile } from '../middlewares/profile'

export type GetProfileParams = {
  name: AccountURN
  profile: object
}

export const SetProfileInput = z.object({
  name: inputValidators.AccountURNInput,
  profile: Profile,
})

export const setProfileMethod = async ({
  input,
  ctx,
}: {
  input: GetProfileParams
  ctx: Context
}) => {
  const res = await ctx.account?.setProfile(input.profile as object)
  return res
}
