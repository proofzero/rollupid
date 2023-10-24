import { z } from 'zod'
import { Context } from '../../context'
import { IdentityRefURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { ServicePlanType } from '@proofzero/types/billing'
import { BadRequestError } from '@proofzero/errors'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '../../../../identity/src/nodes'

export const GetEntitlementsInputSchema = z.object({
  URN: IdentityRefURNValidator,
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

  let ownerNode
  if (IdentityURNSpace.is(input.URN)) {
    ownerNode = initIdentityNodeByName(input.URN, ctx.env.Identity)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.env.IdentityGroup)
  } else {
    throw new BadRequestError({
      message: `URN type not supported`,
    })
  }

  const servicePlans = await ownerNode.class.getServicePlans()
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
