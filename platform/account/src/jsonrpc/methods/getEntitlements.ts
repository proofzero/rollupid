import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'

const PlanTypeEnum = z.nativeEnum(ServicePlanType)

export const GetEntitlementsOutputSchema = z.object({
  customerID: z.string().optional(),
  plans: z.record(
    PlanTypeEnum,
    z.object({
      entitlements: z.number(),
      pendingEntitlements: z.number(),
    })
  ),
})
type GetEntitlementsOutput = z.infer<typeof GetEntitlementsOutputSchema>

export const getEntitlements = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = {
    plans: {},
  }

  const servicePlans = await ctx.account?.class.getServicePlans()
  result.customerID = servicePlans?.customerID

  const servicePlanOrders = await ctx.account?.class.getServicePlanOrders()
  const servicePlanOrdersByType = servicePlanOrders
    ? Object.keys(servicePlanOrders || {})
        .map((k) => servicePlanOrders[k])
        .reduce((acc, v) => {
          if (!acc[v.type]) {
            acc[v.type] = 0
          }
          acc[v.type] += v.quantity
          return acc
        }, {} as Record<ServicePlanType, number>)
    : undefined

  for (const key of Object.keys(ServicePlanType)) {
    const enumKey = PlanTypeEnum.parse(key)
    const resEntry = {
      entitlements: 0,
      pendingEntitlements: 0,
    }

    if (servicePlans?.plans?.[enumKey]) {
      resEntry.entitlements = servicePlans.plans[enumKey].entitlements
    }

    if (servicePlanOrdersByType && servicePlanOrdersByType[enumKey]) {
      resEntry.pendingEntitlements = servicePlanOrdersByType[enumKey]
    }

    result.plans[enumKey] = resEntry
  }

  return result
}
