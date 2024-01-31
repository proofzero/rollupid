import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { ProfileSchema } from '../validators/profile'
import { IdentityURNSpace } from '@proofzero/urns/identity'

export const SetProfileInput = z.object({
  name: inputValidators.IdentityURNInput,
  profile: ProfileSchema,
})

export const setProfileMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof SetProfileInput>
  ctx: Context
}): Promise<void> => {
  // if user is calling this method with the same identityURN in jwt
  // TODO: validate JWT in "ValidateJWT" middleware
  if (ctx.identityURN === input.name) {
    await ctx.identityNode?.class.setProfile(input.profile)
  }

  const qcomps = {
    name: input.profile.displayName,
    picture: input.profile.pfp?.image,
    primaryAccountURN: input.profile?.primaryAccountURN,
  }
  if (ctx.identityURN) {
    const enhancedUrn = IdentityURNSpace.componentizedUrn(
      IdentityURNSpace.decode(ctx.identityURN),
      undefined,
      qcomps
    )

    const caller = router.createCaller(ctx)
    await caller.edges.updateNode({ urnOfNode: enhancedUrn })
  }
  return
}
