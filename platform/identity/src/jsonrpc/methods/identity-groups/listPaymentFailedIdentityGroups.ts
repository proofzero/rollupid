import { z } from 'zod'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'

export const ListPaymentFailedIdentityGroupsOutputSchema = z.array(
  IdentityGroupURNValidator
)
export type ListPaymentFailedIdentityGroupsOutput = z.infer<
  typeof ListPaymentFailedIdentityGroupsOutputSchema
>

export const listPaymentFailedIdentityGroups = async ({
  ctx,
}: {
  ctx: Context
}): Promise<ListPaymentFailedIdentityGroupsOutput> => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const resURNs = []
  for (const edge of edges) {
    const igNode = initIdentityGroupNodeByName(
      edge.dst.baseUrn,
      ctx.env.IdentityGroup
    )
    const spd = await igNode.class.getStripePaymentData()
    if (spd && spd.paymentFailed) {
      resURNs.push(edge.dst.baseUrn)
    }
  }

  return resURNs as ListPaymentFailedIdentityGroupsOutput
}
