import { z } from 'zod'
import { Context } from '../../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { RollupError } from '@proofzero/errors'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

export const CreateIdentityGroupInputSchema = z.object({
  accountURN: AccountURNInput,
  name: z.string(),
})

type CreateIdentityGroupInput = z.infer<typeof CreateIdentityGroupInputSchema>

export const createIdentityGroup = async ({
  input,
  ctx,
}: {
  input: CreateIdentityGroupInput
  ctx: Context
}): Promise<void> => {
  const name = hexlify(randomBytes(IDENTITY_GROUP_OPTIONS.length))
  const groupURN = IdentityGroupURNSpace.componentizedUrn(name, undefined, {
    name: input.name,
  })
  const baseGroupURN = IdentityGroupURNSpace.getBaseURN(groupURN)

  const accountNode = await ctx.edges.findNode.query({
    baseUrn: input.accountURN,
  })
  if (!accountNode) {
    throw new RollupError({
      message: 'Account node not found',
    })
  }

  await ctx.edges.updateNode.mutate({
    urnOfNode: groupURN,
  })

  const primaryAddressURN = AddressURNSpace.getBaseURN(
    accountNode.qc.primaryAddressURN as AddressURN
  )
  await ctx.edges.makeEdge.mutate({
    src: primaryAddressURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: baseGroupURN,
  })
}
