import { z } from 'zod'
import {
  AccountURNInput,
  AddressURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'
import { RollupError } from '@proofzero/errors'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

import { Context } from '../../../context'

export const ListIdentityGroupsInputSchema = z.object({
  accountURN: AccountURNInput,
})
type ListIdentityGroupsInput = z.infer<typeof ListIdentityGroupsInputSchema>

export const ListIdentityGroupsOutputSchema = z.array(
  z.object({
    URN: IdentityGroupURNValidator,
    name: z.string(),
    members: z.array(
      z.object({
        URN: AddressURNInput,
        joinTimestamp: z.number().nullable(),
      })
    ),
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
  const caller = router.createCaller(ctx)
  const accountNode = await caller.edges.findNode({
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

  const { edges: addressEdges } = await caller.edges.getEdges({
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

  const identityGroupResults = await Promise.all(
    addressURNList.map((addressURN) =>
      caller.edges.getEdges({
        query: {
          src: {
            baseUrn: addressURN,
          },
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        },
      })
    )
  )
  const identityGroupEdges = identityGroupResults.flatMap(
    (result) => result.edges
  )

  const uniqueIdentityGroupEdges = [
    ...new Set(identityGroupEdges.map((edge) => edge.dst.baseUrn)),
  ]
    .map((baseUrn) =>
      identityGroupEdges.find((edge) => edge.dst.baseUrn === baseUrn)
    )
    .filter((edge) => edge != null)

  const identityGroups: ListIdentityGroupsOutput = await Promise.all(
    uniqueIdentityGroupEdges.map(async (edge) => {
      const URN = edge!.dst.baseUrn as IdentityGroupURN
      const name = edge!.dst.qc.name

      const { edges: groupMemberEdges } = await caller.edges.getEdges({
        query: {
          tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
          dst: {
            baseUrn: URN,
          },
        },
      })

      const mappedMembers = groupMemberEdges.map((edge) => ({
        URN: edge.src.baseUrn as AddressURN,
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
