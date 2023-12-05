import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'
import { Context } from '../../context'
import { ProfileSchema } from '../validators/profile'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { InternalServerError } from '@proofzero/errors'
import createImageClient from '@proofzero/platform-clients/image'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

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
  if (!ctx.identityNode) {
    throw new InternalServerError({
      message: 'Identity node not found',
    })
  }

  const caller = router.createCaller(ctx)

  const existingProfile = await ctx.identityNode.class.getProfile()
  const identityGraphNode = await caller.edges.findNode({
    baseUrn: ctx.identityURN,
  })

  // if user is calling this method with the same identityURN in jwt
  // TODO: validate JWT in "ValidateJWT" middleware
  if (ctx.identityURN === input.name) {
    await ctx.identityNode.class.setProfile(input.profile)
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

    await caller.edges.updateNode({ urnOfNode: enhancedUrn })
  }

  if (existingProfile && identityGraphNode) {
    if (
      existingProfile.primaryAccountURN !==
      identityGraphNode.qc.primaryAccountURN
    ) {
      throw new InternalServerError({
        message: 'Primary account URN mismatch',
      })
    }

    const accountNodeProfiles = await caller.account.getAccountProfileBatch([
      existingProfile.primaryAccountURN,
    ])
    if (!accountNodeProfiles || accountNodeProfiles.length === 0) {
      throw new InternalServerError({
        message: 'Primary account node not found',
      })
    }

    if (
      existingProfile.pfp?.image &&
      existingProfile.pfp?.image !== accountNodeProfiles[0].icon
    ) {
      const imageClient = createImageClient(ctx.env.Images, {
        headers: generateTraceContextHeaders(ctx.traceSpan),
      })

      if (ctx.waitUntil) {
        ctx.waitUntil(imageClient.delete.mutate(existingProfile.pfp?.image))
      }
    }
  }
}
