import { ServicePlanType } from '@proofzero/types/identity'
import { z } from 'zod'
import { Context } from '../../context'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityNodeByName } from '../../nodes'

export const UpdateEntitlementsInputSchema = z.object({
  identityURN: IdentityURNInput,
  subscriptionID: z.string(),
  type: z.nativeEnum(ServicePlanType),
  quantity: z.number(),
})
export type UpdateEntitlementsInput = z.infer<
  typeof UpdateEntitlementsInputSchema
>

export const updateEntitlements = async ({
  input,
  ctx,
}: {
  input: UpdateEntitlementsInput
  ctx: Context
}): Promise<void> => {
  const { type, quantity, subscriptionID, identityURN } = input

  const identity = await initIdentityNodeByName(identityURN, ctx.Identity)
  await identity.class.updateEntitlements(type, quantity, subscriptionID)

  // await ctx.identity?.class.updateEntitlements(type, quantity, subscriptionID)
}
