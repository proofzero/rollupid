import { ServicePlanType } from '@proofzero/types/identity'
import { z } from 'zod'
import { Context } from '../../context'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityNodeByName } from '../../nodes'

export const GetEntitlementsInputSchema = z.object({
  identityURN: IdentityURNInput,
})

type GetEntitlementsInput = z.infer<typeof GetEntitlementsInputSchema>

const PlanTypeEnum = z.nativeEnum(ServicePlanType)

export const PlansSchema = z.record(
  PlanTypeEnum,
  z.object({
    entitlements: z.number(),
  })
)

export const GetEntitlementsOutputSchema = z.object({
  subscriptionID: z.string().optional(),
  plans: PlansSchema,
})
export type GetEntitlementsOutput = z.infer<typeof GetEntitlementsOutputSchema>

export const getEntitlements = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: GetEntitlementsInput
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = {
    plans: {},
  }

  const identity = await initIdentityNodeByName(input.identityURN, ctx.Identity)

  const servicePlans = await identity.class.getServicePlans()
  result.subscriptionID = servicePlans?.subscriptionID

  for (const key of Object.keys(ServicePlanType)) {
    const enumKey = PlanTypeEnum.parse(key)
    const resEntry = {
      entitlements: 0,
    }

    if (servicePlans?.plans?.[enumKey]) {
      resEntry.entitlements = servicePlans.plans[enumKey]?.entitlements ?? 0
    }

    result.plans[enumKey] = resEntry
  }

  return result
}
