import { z } from 'zod'

import { InternalServerError } from '@proofzero/errors'

import { router } from '@proofzero/platform.core'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { EDGE_AUTHORIZES } from '@proofzero/platform.authorization/src/constants'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { initIdentityNodeByName } from '../../nodes'

export const MergePreviewInput = z.object({
  source: IdentityURNInput,
  target: IdentityURNInput,
})
type MergePreviewInput = z.infer<typeof MergePreviewInput>

const IdentitySummary = z.object({
  avatar: z.string(),
  displayName: z.string(),
  primaryAccountAlias: z.string(),
  accounts: z.number(),
  applications: z.number(),
})

export const MergePreviewOutput = z.object({
  source: IdentitySummary.optional(),
  target: IdentitySummary.optional(),
})
type MergePreviewOutput = z.infer<typeof MergePreviewOutput>

type MergePreviewParams = {
  input: MergePreviewInput
  ctx: Context
}

type MergePreviewResult = MergePreviewOutput

interface MergePreviewMethod {
  (params: MergePreviewParams): Promise<MergePreviewResult>
}

export const mergePreviewMethod: MergePreviewMethod = async ({
  input,
  ctx,
}) => {
  const { source, target } = input

  const sourceIdentityNode = initIdentityNodeByName(source, ctx.env.Identity)
  const sourceIdentityProfile = await sourceIdentityNode.class.getProfile()
  const targetIdentityNode = initIdentityNodeByName(target, ctx.env.Identity)
  const targetIdentityProfile = await targetIdentityNode.class.getProfile()

  if (!sourceIdentityProfile)
    throw new InternalServerError({
      message: 'missing source identity profile',
    })

  if (!targetIdentityProfile)
    throw new InternalServerError({
      message: 'missing target identity profile',
    })

  const caller = router.createCaller(ctx)

  let sourceIdentityPrimaryAccountProfile
  if (sourceIdentityProfile.primaryAccountURN) {
    ;[sourceIdentityPrimaryAccountProfile] =
      await caller.account.getAccountProfileBatch([
        sourceIdentityProfile.primaryAccountURN,
      ])
  }

  let targetIdentityPrimaryAccountProfile
  if (targetIdentityProfile.primaryAccountURN) {
    ;[targetIdentityPrimaryAccountProfile] =
      await caller.account.getAccountProfileBatch([
        targetIdentityProfile.primaryAccountURN,
      ])
  }

  const { edges: sourceIdentityAccountEdges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: source },
      tag: EDGE_ACCOUNT,
    },
  })

  const { edges: sourceIdentityApplicationEdges } = await caller.edges.getEdges(
    {
      query: {
        src: { baseUrn: source },
        tag: EDGE_AUTHORIZES,
      },
    }
  )

  const { edges: targetIdentityAccountEdges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: target },
      tag: EDGE_ACCOUNT,
    },
  })

  const { edges: targetIdentityApplicationEdges } = await caller.edges.getEdges(
    {
      query: {
        src: { baseUrn: target },
        tag: EDGE_AUTHORIZES,
      },
    }
  )

  return {
    source: sourceIdentityProfile
      ? {
          avatar: sourceIdentityProfile.pfp?.image || '',
          displayName: sourceIdentityProfile.displayName,
          primaryAccountAlias: sourceIdentityPrimaryAccountProfile?.title || '',
          accounts: sourceIdentityAccountEdges.length,
          applications: sourceIdentityApplicationEdges.length,
        }
      : undefined,
    target: targetIdentityProfile
      ? {
          avatar: targetIdentityProfile.pfp?.image || '',
          displayName: targetIdentityProfile.displayName,
          primaryAccountAlias: targetIdentityPrimaryAccountProfile?.title || '',
          accounts: targetIdentityAccountEdges.length,
          applications: targetIdentityApplicationEdges.length,
        }
      : undefined,
  }
}
