import { z } from 'zod'
import { Context } from '../../../context'
import {
  AccountURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'
import { RollupError } from '@proofzero/errors'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

export const ListIdentityGroupsInputSchema = z.object({
  accountURN: AccountURNInput,
})
type ListIdentityGroupsInput = z.infer<typeof ListIdentityGroupsInputSchema>

export const ListIdentityGroupsOutputSchema = z.array(
  z.object({
    URN: IdentityGroupURNValidator,
    name: z.string(),
  })
)
export type ListIdentityGroupsOutput = z.infer<
  typeof ListIdentityGroupsOutputSchema
>

export const listIdentityGroups = async ({
  input,
  ctx,
}: {
  input: ListIdentityGroupsInput
  ctx: Context
}): Promise<ListIdentityGroupsOutput> => {
  const accountNode = await ctx.edges.findNode.query({
    baseUrn: input.accountURN,
  })
  if (!accountNode) {
    throw new RollupError({
      message: 'Account node not found',
    })
  }

  const primaryAddressURN = AddressURNSpace.getBaseURN(
    accountNode.qc.primaryAddressURN as AddressURN
  )

  const { edges: addressEdges } = await ctx.edges.getEdges.query({
    query: {
      src: {
        baseUrn: input.accountURN,
      },
      tag: EDGE_ADDRESS,
    },
  })
  const addressURNList = addressEdges
    .map((edge) => edge.dst.baseUrn)
    .concat(primaryAddressURN)

  const identityGroupEdges = []
  for (const addressURN of addressURNList) {
    const { edges: groupEdges } = await ctx.edges.getEdges.query({
      query: {
        src: {
          baseUrn: addressURN,
        },
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      },
    })
    identityGroupEdges.push(...groupEdges)
  }

  const identityGroups: ListIdentityGroupsOutput = identityGroupEdges.map(
    (edge) => ({
      URN: edge.dst.baseUrn as IdentityGroupURN,
      name: edge.dst.qc.name,
    })
  )

  return identityGroups
}
