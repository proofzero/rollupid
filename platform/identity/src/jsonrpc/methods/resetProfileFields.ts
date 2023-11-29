import { Context } from '../../context'
import { InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { IdentityURNSpace } from '@proofzero/urns/identity'

export const resetProfileFieldsMethod = async ({
  ctx,
}: {
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

  if (profile.primaryAccountURN !== identityGraphNode.qc.primaryAccountURN) {
    throw new InternalServerError({
      message: 'Primary account URN mismatch',
    })
  }

  const primaryAccountURN = profile.primaryAccountURN
  const accountNodeProfiles = await caller.account.getAccountProfileBatch([
    primaryAccountURN,
  ])
  if (!accountNodeProfiles || accountNodeProfiles.length === 0) {
    throw new InternalServerError({
      message: 'Primary account node not found',
    })
  }

  const primaryAccountProfile = accountNodeProfiles[0]

  profile.displayName = primaryAccountProfile.title
  identityGraphNode.qc.name = primaryAccountProfile.title

  if (!primaryAccountProfile.icon) {
    console.warn('Primary account node has no icon')
  } else {
    profile.pfp = {
      image: primaryAccountProfile.icon,
      isToken: false,
    }
    identityGraphNode.qc.picture = primaryAccountProfile.icon
  }

  await Promise.all([
    ctx.identityNode.class.setProfile(profile),
    ctx.identityNode.class.setProfileCustomized(false),
    caller.edges.updateNode({
      urnOfNode: IdentityURNSpace.componentizedUrn(
        identityGraphNode.baseUrn.replace('urn:rollupid:identity/', ''), // wtf...
        identityGraphNode.rc,
        identityGraphNode.qc
      ),
    }),
  ])
}
