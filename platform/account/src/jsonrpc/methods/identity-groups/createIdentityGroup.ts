import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { RollupError } from '@proofzero/errors'
import { AddressURN, AddressURNSpace } from '@proofzero/urns/address'

import { Context } from '../../../context'

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

  const caller = router.createCaller(ctx)

  const accountNode = await caller.edges.findNode({
    baseUrn: input.accountURN,
  })
  if (!accountNode) {
    throw new RollupError({
      message: 'Account node not found',
    })
  }

  await caller.edges.updateNode({
    urnOfNode: groupURN,
  })

  const primaryAddressURN = AddressURNSpace.getBaseURN(
    accountNode.qc.primaryAddressURN as AddressURN
  )
  await caller.edges.makeEdge({
    src: primaryAddressURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: baseGroupURN,
  })
}
