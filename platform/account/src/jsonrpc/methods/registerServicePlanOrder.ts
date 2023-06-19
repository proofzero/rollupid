import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

export const RegisterServicePlanOrderInputSchema = z.object({
  planType: z.nativeEnum(ServicePlanType),
  quantity: z.number(),
  nonce: z.string(),
})
export type RegisterServicePlanOrderInput = z.infer<
  typeof RegisterServicePlanOrderInputSchema
>

export const registerServicePlanOrder = async ({
  input,
  ctx,
}: {
  input: RegisterServicePlanOrderInput
  ctx: Context
}): Promise<void> => {
  const { planType, quantity, nonce } = input

  await ctx.account?.class.registerServicePlanOrder(planType, quantity, nonce)
}
