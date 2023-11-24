import { z } from 'zod'
import { Context } from '../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '@proofzero/platform.identity/src/nodes'

export const GetUsedIdentityGroupSeatsInputSchema = z.object({
  URN: IdentityGroupURNValidator,
})
export type GetUsedIdentityGroupSeatsInput = z.infer<
  typeof GetUsedIdentityGroupSeatsInputSchema
>

export const GetUsedIdentityGroupSeatsOutputSchema = z.number()
export type GetUsedIdentityGroupSeatsOutput = z.infer<
  typeof GetUsedIdentityGroupSeatsOutputSchema
>

export const getUsedIdentityGroupSeats = async ({
  input,
  ctx,
}: {
  input: GetUsedIdentityGroupSeatsInput
  ctx: Context
}): Promise<GetUsedIdentityGroupSeatsOutput> => {
  const ownerNode = initIdentityGroupNodeByName(
    input.URN,
    ctx.env.IdentityGroup
  )

  const orderedMembers = await ownerNode.class.getOrderedMembers()
  const invitations = await ownerNode.class.getInvitations()

  return orderedMembers.length + invitations.length
}
