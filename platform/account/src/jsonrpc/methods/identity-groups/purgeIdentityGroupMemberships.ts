import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { AccountURN } from '@proofzero/urns/account'

export const purgeIdentityGroupMemberships = async ({
  ctx,
}: {
  ctx: Context
}): Promise<void> => {
  const caller = router.createCaller(ctx)

  const { edges: identityGroupMembershipEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.accountURN as AccountURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  await Promise.all(
    identityGroupMembershipEdges.map(({ src, tag, dst }) =>
      caller.edges.removeEdge({
        src: src.baseUrn,
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        dst: dst.baseUrn,
      })
    )
  )
}
