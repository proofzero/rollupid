import { z } from 'zod'
import { Context } from '../../../context'
import {
  AddressURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { RollupError } from '@proofzero/errors'

export const GetIdentityGroupInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type GetIdentityGroupInput = z.infer<typeof GetIdentityGroupInputSchema>

export const GetIdentityGroupOutputSchema = z.object({
  name: z.string(),
  members: z.array(AddressURNInput),
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

  return {
    name: groupNode.qc.name,
    members: [],
  }
}
