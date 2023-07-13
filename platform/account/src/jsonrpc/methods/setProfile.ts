import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { ProfileSchema } from '../validators/profile'
import { AccountURNSpace } from '@proofzero/urns/account'

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
    await ctx.accountNode?.class.setProfile(input.profile)
  }

  const qcomps = {
    name: input.profile.displayName,
    picture: input.profile.pfp?.image,
    primaryAddressURN: input.profile?.primaryAddressURN,
  }
  if (ctx.accountURN) {
    const enhancedUrn = AccountURNSpace.componentizedUrn(
      AccountURNSpace.decode(ctx.accountURN),
      undefined,
      qcomps
    )

    const caller = router.createCaller(ctx)
    await caller.edges.updateNode({ urnOfNode: enhancedUrn })
  }
  return
}
