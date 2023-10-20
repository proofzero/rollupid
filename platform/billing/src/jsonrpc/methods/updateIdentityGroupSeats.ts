import { z } from 'zod'
import { Context } from '../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../../identity/src/nodes'

export const UpdateIdentityGroupSeatsInputSchema = z.object({
  URN: IdentityGroupURNValidator,
  subscriptionID: z.string(),
  quantity: z.number(),
})
export type UpdateIdentityGroupSeatsInput = z.infer<
  typeof UpdateIdentityGroupSeatsInputSchema
>

export const updateIdentityGroupSeats = async ({
  input,
  ctx,
}: {
  input: UpdateIdentityGroupSeatsInput
  ctx: Context
}): Promise<void> => {
  const { quantity, subscriptionID } = input

  const ownerNode = initIdentityGroupNodeByName(
    input.URN,
    ctx.env.IdentityGroup
  )
  await ownerNode.class.updateSeats(quantity, subscriptionID)
}
