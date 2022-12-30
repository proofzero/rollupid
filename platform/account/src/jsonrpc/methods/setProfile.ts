import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { ProfileSchema } from '../middlewares/profile'

export const SetProfileInput = z.object({
  name: inputValidators.AccountURNInput,
  profile: ProfileSchema,
})

export const setProfileMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetProfileInput>
  ctx: Context
}): Promise<void> => {
  await ctx.account?.setProfile(input.profile)
  return
}
