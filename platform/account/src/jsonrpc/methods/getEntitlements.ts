import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

export const GetEntitlementsOutputSchema = z.array(
  z.object({
    planType: z.nativeEnum(ServicePlanType),
    entitlements: z.number(),
  })
)
export type GetEntitlementsOutput = z.infer<typeof GetEntitlementsOutputSchema>

export const getEntitlements = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = []

  const servicePlans = await ctx.account?.class.getServicePlans()
  if (!servicePlans) {
    return []
  }

  if (servicePlans.plans) {
    for (let [key, value] of Object.entries(servicePlans.plans)) {
      result.push({ planType: +key, entitlements: value.entitlements })
    }
  }

  return result
}
