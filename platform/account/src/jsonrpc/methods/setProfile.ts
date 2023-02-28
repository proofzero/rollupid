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
  // if user is calling this method with the same accountURN in jwt
  // TODO: validate JWT in "ValidateJWT" middleware
  if (ctx.accountURN === input.name) {
    await ctx.account?.class.setProfile(input.profile)
  }

  const qcomps = {
    name: input.profile.displayName,
    picture: input.profile.pfp?.image,
  }
  if (ctx.accountURN) {
    const enhancedUrn = AccountURNSpace.componentizedUrn(
      AccountURNSpace.decode(ctx.accountURN),
      undefined,
      qcomps
    )

    const edge = ctx.edges
    // Don't need to await it
    // Fire and go
    edge.updateNode.mutate({ urnOfNode: enhancedUrn })
  }
  return
}
