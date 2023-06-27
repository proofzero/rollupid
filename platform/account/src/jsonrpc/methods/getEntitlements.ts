import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

const PlanTypeEnum = z.nativeEnum(ServicePlanType)

export const GetEntitlementsOutputSchema = z.object({
  subscriptionID: z.string().optional(),
  plans: z.record(
    PlanTypeEnum,
    z.object({
      entitlements: z.number(),
    })
  ),
})
export type GetEntitlementsOutput = z.infer<typeof GetEntitlementsOutputSchema>

export const getEntitlements = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = {
    plans: {},
  }

  const servicePlans = await ctx.account?.class.getServicePlans()
  result.subscriptionID = servicePlans?.subscriptionID

  for (const key of Object.keys(ServicePlanType)) {
    const enumKey = PlanTypeEnum.parse(key)
    const resEntry = {
      entitlements: 0,
      pendingEntitlements: 0,
    }

    if (servicePlans?.plans?.[enumKey]) {
      resEntry.entitlements = servicePlans.plans[enumKey]?.entitlements ?? 0
    }

    result.plans[enumKey] = resEntry
  }

  return result
}
