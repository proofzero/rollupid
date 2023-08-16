import { z } from 'zod'
import { Context } from '../../context'
import { inputValidators } from '@proofzero/platform-middleware'
import { initIdentityNodeByName } from '../../nodes'
export const CancelServicePlansInput = z.object({
  identity: inputValidators.IdentityURNInput,
  subscriptionID: z.string(),
  deletePaymentData: z.boolean().optional(),
})

export type CancelServicePlansParams = z.infer<typeof CancelServicePlansInput>

export const cancelServicePlans = async ({
  input,
  ctx,
}: {
  input: CancelServicePlansParams
  ctx: Context
}) => {
  const servicePlansNode = await initIdentityNodeByName(
    input.identity,
    ctx.Identity
  )

  await servicePlansNode.storage.delete('servicePlans')
  if (input.deletePaymentData) {
    await servicePlansNode.storage.delete('stripePaymentData')
  }
}
