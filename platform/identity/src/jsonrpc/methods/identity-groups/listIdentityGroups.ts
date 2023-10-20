import { z } from 'zod'
import {
  IdentityURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'
import { RollupError } from '@proofzero/errors'

import { Context } from '../../../context'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'
import { initIdentityGroupNodeByName } from '../../../nodes'

export const ListIdentityGroupsOutputSchema = z.array(
  z.object({
    URN: IdentityGroupURNValidator,
    name: z.string(),
    members: z.array(
      z.object({
        URN: IdentityURNInput,
        joinTimestamp: z.number().nullable(),
      })
    ),
    flags: z.object({
      billingConfigured: z.boolean().default(false),
    }),
  })
)
export type ListIdentityGroupsOutput = z.infer<
  typeof ListIdentityGroupsOutputSchema
>

export const listIdentityGroups = async ({
  ctx,
}: {
  ctx: Context
}): Promise<ListIdentityGroupsOutput> => {
  const caller = router.createCaller(ctx)
  const identityNode = await caller.edges.findNode({
    baseUrn: ctx.identityURN,
  })
  if (!identityNode) {
    throw new RollupError({
      message: 'Identity node not found',
    })
  }

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroups: ListIdentityGroupsOutput = await Promise.all(
    edges.map(async (edge) => {
      const URN = edge.dst.baseUrn as IdentityGroupURN
      const name = edge.dst.qc.name

      const igNode = initIdentityGroupNodeByName(URN, ctx.env.IdentityGroup)
      const opRes = await Promise.all([
        igNode.class.getStripePaymentData(),
        igNode.class.getOrderedMembers(),
      ])

      const spd = opRes[0]
      let orderedMembers = opRes[1]

      const { edges: groupMemberEdges } = await caller.edges.getEdges({
        query: {
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
          dst: {
            baseUrn: URN,
          },
        },
      })

      // If there is no ordered members in the DO
      // or if the numbers mismatch
      // we do a reinitialization with
      // the graph as a source of truth
      if (groupMemberEdges.length !== orderedMembers.length) {
        orderedMembers = groupMemberEdges.map(
          (edge) => edge.src.baseUrn as IdentityURN
        )
        await igNode.class.setOrderedMembers(orderedMembers)
      }

      const mappedMembers = groupMemberEdges
        .filter((edge) => IdentityURNSpace.is(edge.src.baseUrn))
        .map((edge) => ({
          URN: edge.src.baseUrn as IdentityURN,
          joinTimestamp: edge.createdTimestamp
            ? new Date((edge.createdTimestamp as string) + ' UTC').getTime()
            : null,
        }))

      const mappedOrderedMembers = orderedMembers
        .map((om) => mappedMembers.find((m) => m.URN === om))
        .filter(Boolean) as {
        URN: IdentityURN
        joinTimestamp: number | null
      }[]

      return {
        URN,
        name,
        members: mappedOrderedMembers,
        flags: {
          billingConfigured: Boolean(spd?.paymentMethodID),
        },
      }
    })
  )

  return identityGroups
}
