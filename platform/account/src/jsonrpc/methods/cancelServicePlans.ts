import { z } from 'zod'
import { Context } from '../../context'
import { inputValidators } from '@proofzero/platform-middleware'
import { initAccountNodeByName } from '../../nodes'
import { ServicePlanType } from '@proofzero/types/account'

export const CancelServicePlansInput = z.object({
  account: inputValidators.AccountURNInput,
  subscriptionID: z.string(),
})

export type CancelServicePlansParams = z.infer<typeof CancelServicePlansInput>

export const cancelServicePlans = async ({
  input,
  ctx,
}: {
  input: CancelServicePlansParams
  ctx: Context
}) => {
  const servicePlansNode = await initAccountNodeByName(
    input.account,
    ctx.Account
  )

  await servicePlansNode.storage.delete('servicePlans')
  for (const type of Object.keys(ServicePlanType)) {
    await servicePlansNode.class.updateEntitlements(
      type as ServicePlanType,
      0,
      input.subscriptionID
    )
  }
}
