import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { InternalServerError } from '@proofzero/errors'
import { IdentityURN } from '@proofzero/urns/identity'
import { initIdentityGroupNodeByName } from '../../../nodes'

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

      if (igMembershipEdges.length === 1) {
        await caller.edges.deleteNode({
          urn: igu,
        })

        const DO = await initIdentityGroupNodeByName(igu, ctx.IdentityGroup)
        if (DO) {
          await DO.storage.deleteAll()
        }
      }
    })
  )
}
