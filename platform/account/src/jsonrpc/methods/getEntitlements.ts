import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initAccountNodeByName } from '../../nodes'

export const GetEntitlementsInputSchema = z.object({
  accountURN: AccountURNInput,
})

type GetEntitlementsInput = z.infer<typeof GetEntitlementsInputSchema>

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
  input,
}: {
  ctx: Context
  input: GetEntitlementsInput
}): Promise<GetEntitlementsOutput> => {
  const result: GetEntitlementsOutput = {
    plans: {},
  }

  const account = await initAccountNodeByName(input.accountURN, ctx.Account)

  const servicePlans = await account.class.getServicePlans()
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
