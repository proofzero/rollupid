import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { ProfileSchema } from '../validators/profile'
import { AccountURNSpace } from '@kubelt/urns/account'

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
  await ctx.account?.class.setProfile(input.profile)

  const qcomps = {
    name: input.profile.displayName,
    picture: input.profile.pfp?.image,
  }
  const enhancedUrn = AccountURNSpace.componentizedUrn(
    AccountURNSpace.decode(ctx.accountURN!),
    undefined,
    qcomps
  )

  //TODO make this asynchornous so user's don't need to wait
  //for the second leg of IO to complete
  const edge = ctx.edges
  await edge.updateNode.mutate({ urnOfNode: enhancedUrn })
  return
}
