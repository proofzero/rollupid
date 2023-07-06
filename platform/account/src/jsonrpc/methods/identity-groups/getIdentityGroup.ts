import { z } from 'zod'
import { Context } from '../../../context'
import {
  AddressURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { RollupError } from '@proofzero/errors'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { AddressURN } from '@proofzero/urns/address'

export const GetIdentityGroupInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type GetIdentityGroupInput = z.infer<typeof GetIdentityGroupInputSchema>

export const GetIdentityGroupOutputSchema = z.object({
  name: z.string(),
  members: z.array(
    z.object({
      URN: AddressURNInput,
      joinTimestamp: z.number().nullable(),
    })
  ),
})
export type GetIdentityGroupOutput = z.infer<
  typeof GetIdentityGroupOutputSchema
>

export const getIdentityGroup = async ({
  input,
  ctx,
}: {
  input: GetIdentityGroupInput
  ctx: Context
}): Promise<GetIdentityGroupOutput> => {
  const groupNode = await ctx.edges.findNode.query({
    baseUrn: input.identityGroupURN,
  })
  if (!groupNode) {
    throw new RollupError({
      message: 'Identity group node not found',
    })
  }

  const { edges: groupMemberEdges } = await ctx.edges.getEdges.query({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: input.identityGroupURN,
      },
    },
  })

  console.log(JSON.stringify(groupMemberEdges, null, 2))

  const mappedMembers = groupMemberEdges.map((edge) => ({
    URN: edge.src.baseUrn as AddressURN,
    joinTimestamp: edge.createdTimestamp
      ? new Date((edge.createdTimestamp as string) + ' UTC').getTime()
      : null,
  }))

  console.log(
    JSON.stringify(
      {
        name: groupNode.qc.name,
        members: mappedMembers,
      },
      null,
      2
    )
  )

  return {
    name: groupNode.qc.name,
    members: mappedMembers,
  }
}
