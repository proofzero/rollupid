import { z } from 'zod'
import { Context } from '../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '@proofzero/platform.identity/src/nodes'

export const GetIdentityGroupSeatsInputSchema = z.object({
  URN: IdentityGroupURNValidator,
})
export type GetIdentityGroupSeatsInput = z.infer<
  typeof GetIdentityGroupSeatsInputSchema
>

export const GetIdentityGroupSeatsOutputSchema = z
  .object({
    subscriptionID: z.string(),
    quantity: z.number(),
  })
  .optional()

export type GetIdentityGroupSeatsOutput = z.infer<
  typeof GetIdentityGroupSeatsOutputSchema
>

export const getIdentityGroupSeats = async ({
  input,
  ctx,
}: {
  input: GetIdentityGroupSeatsInput
  ctx: Context
}): Promise<GetIdentityGroupSeatsOutput> => {
  let ownerNode = initIdentityGroupNodeByName(input.URN, ctx.IdentityGroup)
  return ownerNode.class.getSeats()
}
