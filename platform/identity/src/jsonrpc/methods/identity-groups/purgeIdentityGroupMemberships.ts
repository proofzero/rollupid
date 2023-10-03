import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { IdentityURN } from '@proofzero/urns/identity'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const purgeIdentityGroupMemberships = async ({
  ctx,
}: {
  ctx: Context
}): Promise<void> => {
  const caller = router.createCaller(ctx)

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroupURNList = edges.map((e) => e.dst.baseUrn)
  await Promise.all(
    identityGroupURNList.map(async (igu) => {
      const { edges: igMembershipEdges } = await caller.edges.getEdges({
        query: {
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
          dst: {
            baseUrn: igu,
          },
        },
      })

      await caller.edges.removeEdge({
        src: ctx.identityURN as IdentityURN,
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        dst: igu,
      })

      const DO = initIdentityGroupNodeByName(igu, ctx.IdentityGroup)
      if (DO) {
        const orderedMembers = await DO.class.getOrderedMembers()
        await DO.class.setOrderedMembers(
          orderedMembers.filter((urn) => urn !== ctx.identityURN)
        )
      }

      if (igMembershipEdges.length === 1) {
        await caller.edges.deleteNode({
          urn: igu,
        })

        if (DO) {
          await DO.storage.deleteAll()
        }
      }
    })
  )

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'group_memberships_purged',
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
    })
  )
}
