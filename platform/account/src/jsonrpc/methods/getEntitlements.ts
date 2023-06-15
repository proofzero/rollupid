import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

const PlanTypeEnum = z.nativeEnum(ServicePlanType)

export const GetEntitlementsOutputSchema = z.record(
  PlanTypeEnum,
  z.object({
    entitlements: z.number(),
    pendingEntitlements: z.number(),
  })
)
type GetEntitlementsOutput = z.infer<typeof GetEntitlementsOutputSchema>

export const getEntitlements = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = {}

  const servicePlans = (await ctx.account?.class.getServicePlans()) ?? {}
  const servicePlanOrders =
    (await ctx.account?.class.getServicePlanOrders()) ?? {}

  for (const key of Object.keys(ServicePlanType)) {
    const enumKey = PlanTypeEnum.parse(key)
    const entitlements = servicePlans.plans?.[enumKey]?.entitlements || 0
    const pendingEntitlements = Object.keys(servicePlanOrders)
      .map((key) => servicePlanOrders[key])
      .filter((o) => o.type === enumKey)
      .reduce((acc, o) => acc + o.quantity, 0)

    result[enumKey] = {
      entitlements,
      pendingEntitlements,
    }
  }

  return result
}
