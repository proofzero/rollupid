import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

export const UpdateEntitlementsInputSchema = z.object({
  planType: z.nativeEnum(ServicePlanType),
  delta: z.number(),
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
  const { planType: type, delta } = input

  await ctx.account?.class.updateEntitlements(type, delta)
}
