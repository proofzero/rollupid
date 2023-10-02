import { z } from 'zod'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'

export const ListNastyIdentityGroupsOutputSchema = z.array(
  IdentityGroupURNValidator
)
export type ListNastyIdentityGroupsOutput = z.infer<
  typeof ListNastyIdentityGroupsOutputSchema
>

export const listNastyIdentityGroups = async ({
  ctx,
}: {
  ctx: Context
}): Promise<ListNastyIdentityGroupsOutput> => {
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroups: ListNastyIdentityGroupsOutput = await Promise.all(
    edges
      .filter(async (edge) => {
        const URN = edge.dst.baseUrn as IdentityGroupURN

        const igNode = initIdentityGroupNodeByName(URN, ctx.IdentityGroup)
        const spd = await igNode.class.getStripePaymentData()

        return Boolean(spd?.paymentFailed)
      })
      .map((edge) => edge.dst.baseUrn as IdentityGroupURN)
  )

  return identityGroups
}
