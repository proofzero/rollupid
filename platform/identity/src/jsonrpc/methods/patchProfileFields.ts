import { z } from 'zod'
import { Context } from '../../context'
import { InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import createImageClient from '@proofzero/platform-clients/image'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

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

  if (!IdentityURNSpace.is(identityGraphNode.baseUrn)) {
    throw new InternalServerError({
      message: 'Identity graph node URN is invalid',
    })
  }

  if (!profile.primaryAccountURN) {
    throw new InternalServerError({
      message: 'Primary account URN not found',
    })
  }
  if (!identityGraphNode.qc.primaryAccountURN) {
    throw new InternalServerError({
      message: 'Identity graph node primary account URN not found',
    })
  }
  if (!AccountURNSpace.is(identityGraphNode.qc.primaryAccountURN)) {
    throw new InternalServerError({
      message: 'Identity graph node primary account URN is invalid',
    })
  }

  if (
    AccountURNSpace.getBaseURN(profile.primaryAccountURN) !==
    AccountURNSpace.getBaseURN(
      identityGraphNode.qc.primaryAccountURN as AccountURN
    )
  ) {
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

  const primaryAccountPicture = accountNodeProfiles[0].icon
  const existingProfilePicture = profile.pfp?.image

  if (input.displayName) {
    if (profile.displayName !== identityGraphNode.qc.name) {
      throw new InternalServerError({
        message: 'Display name mismatch',
      })
    }

    profile.displayName = input.displayName
    identityGraphNode.qc.name = input.displayName

    profile.customized = true
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

    profile.customized = true
  }

  await Promise.all([
    ctx.identityNode.class.setProfile(profile),
    caller.edges.updateNode({
      urnOfNode: IdentityURNSpace.componentizedUrn(
        IdentityURNSpace.nss(identityGraphNode.baseUrn).split('/')[1],
        identityGraphNode.rc,
        identityGraphNode.qc
      ),
    }),
  ])

  if (
    existingProfilePicture &&
    existingProfilePicture !== profile.pfp?.image &&
    existingProfilePicture !== primaryAccountPicture
  ) {
    const imageClient = createImageClient(ctx.env.Images, {
      headers: generateTraceContextHeaders(ctx.traceSpan),
    })

    ctx.waitUntil!(imageClient.delete.mutate(existingProfilePicture))
  }
}
