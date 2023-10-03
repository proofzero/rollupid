import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { BadRequestError, UnauthorizedError } from '@proofzero/errors'
import { EDGE_APPLICATION } from '@proofzero/platform.starbase/src/types'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { IdentityURN } from '@proofzero/urns/identity'
import { getErrorCause } from '@proofzero/utils/errors'

export const DeleteIdentityGroupInputSchema = IdentityGroupURNValidator
type DeleteIdentityGroupInput = z.infer<typeof DeleteIdentityGroupInputSchema>

export const deleteIdentityGroup = async ({
  input: identityGroupURN,
  ctx,
}: {
  input: DeleteIdentityGroupInput
  ctx: Context
}): Promise<void> => {
  if (!ctx.identityURN) {
    throw new BadRequestError({
      message: 'No identity URN in context',
    })
  }

  const DO = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  const { error } = await DO.class.validateAdmin(ctx.identityURN)
  if (error) {
    throw getErrorCause(error)
  }

  const caller = router.createCaller(ctx)
  const { edges: membershipEdges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })

  const { edges: appEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: identityGroupURN,
      },
      tag: EDGE_APPLICATION,
    },
  })
  if (appEdges.length > 0) {
    throw new BadRequestError({
      message: `This group owns one or more apps. Please delete those apps first if
      you want to remove the group.`,
    })
  }

  await Promise.all(
    membershipEdges.map((me) =>
      caller.edges.removeEdge({
        src: me.src.baseUrn,
        tag: me.tag,
        dst: me.dst.baseUrn,
      })
    )
  )

  await caller.edges.deleteNode({
    urn: identityGroupURN,
  })

  if (DO) {
    await DO.storage.deleteAll()
  }

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'group_deleted',
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
      properties: {
        $groups: { group: identityGroupURN },
      },
    })
  )
}
