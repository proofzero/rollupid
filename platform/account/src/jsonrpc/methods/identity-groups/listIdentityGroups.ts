import { z } from 'zod'
import {
  AccountURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'
import { RollupError } from '@proofzero/errors'

import { Context } from '../../../context'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

export const ListIdentityGroupsOutputSchema = z.array(
  z.object({
    URN: IdentityGroupURNValidator,
    name: z.string(),
    members: z.array(
      z.object({
        URN: AccountURNInput,
        joinTimestamp: z.number().nullable(),
      })
    ),
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
  const accountNode = await caller.edges.findNode({
    baseUrn: ctx.accountURN,
  })
  if (!accountNode) {
    throw new RollupError({
      message: 'Account node not found',
    })
  }

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.accountURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroups: ListIdentityGroupsOutput = await Promise.all(
    edges.map(async (edge) => {
      const URN = edge.dst.baseUrn as IdentityGroupURN
      const name = edge.dst.qc.name

      const { edges: groupMemberEdges } = await caller.edges.getEdges({
        query: {
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
          dst: {
            baseUrn: URN,
          },
        },
      })

      const mappedMembers = groupMemberEdges
        .filter((edge) => AccountURNSpace.is(edge.src.baseUrn))
        .map((edge) => ({
          URN: edge.src.baseUrn as AccountURN,
          joinTimestamp: edge.createdTimestamp
            ? new Date((edge.createdTimestamp as string) + ' UTC').getTime()
            : null,
        }))

      return {
        URN,
        name,
        members: mappedMembers,
      }
    })
  )

  return identityGroups
}
