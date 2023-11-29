import { z } from 'zod'
import { Context } from '../../context'
import { InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { IdentityURNSpace } from '@proofzero/urns/identity'

export const PatchProfileFieldsInputSchema = z.object({
  displayName: z.string().max(50).optional(),
  pictureURL: z.string().url().optional(),
})
type PatchProfileFieldsInput = z.infer<typeof PatchProfileFieldsInputSchema>

export const patchProfileFieldsMethod = async ({
  input,
  ctx,
}: {
  input: PatchProfileFieldsInput
  ctx: Context
}): Promise<void> => {
  if (!ctx.identityNode) {
    throw new InternalServerError({
      message: 'Identity node not found',
    })
  }

  const profile = await ctx.identityNode.class.getProfile()
  if (!profile) {
    throw new InternalServerError({
      message: 'Profile not found',
    })
  }

  const caller = router.createCaller(ctx)
  const identityGraphNode = await caller.edges.findNode({
    baseUrn: ctx.identityURN,
  })
  if (!identityGraphNode) {
    throw new InternalServerError({
      message: 'Identity graph node not found',
    })
  }

  if (input.displayName) {
    if (profile.displayName !== identityGraphNode.qc.name) {
      throw new InternalServerError({
        message: 'Display name mismatch',
      })
    }

    profile.displayName = input.displayName
    identityGraphNode.qc.name = input.displayName
  }
  if (input.pictureURL) {
    if (profile.pfp?.image !== identityGraphNode.qc.picture) {
      throw new InternalServerError({
        message: 'Picture URL mismatch',
      })
    }

    profile.pfp = {
      image: input.pictureURL,
      isToken: false,
    }
    identityGraphNode.qc.picture = input.pictureURL
  }

  await Promise.all([
    ctx.identityNode.class.setProfile(profile),
    ctx.identityNode.class.setProfileCustomized(true), // Should this be merged in setProfile?
    caller.edges.updateNode({
      urnOfNode: IdentityURNSpace.componentizedUrn(
        identityGraphNode.baseUrn.replace('urn:rollupid:identity/', ''), // wtf...
        identityGraphNode.rc,
        identityGraphNode.qc
      ),
    }),
  ])
}
