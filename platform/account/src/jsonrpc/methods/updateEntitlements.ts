import { ServicePlanType } from '@proofzero/types/account'
import { z } from 'zod'
import { Context } from '../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initAccountNodeByName } from '../../nodes'

export const UpdateEntitlementsInputSchema = z.object({
  accountURN: AccountURNInput,
  subscriptionID: z.string(),
  type: z.nativeEnum(ServicePlanType),
  quantity: z.number(),
})
export type UpdateEntitlementsInput = z.infer<
  typeof UpdateEntitlementsInputSchema
>

export const updateEntitlements = async ({
  input,
  ctx,
}: {
  input: UpdateEntitlementsInput
  ctx: Context
}): Promise<void> => {
  const { type, quantity, subscriptionID, accountURN } = input

  // const account = await initAccountNodeByName(accountURN, ctx.Account)
  // await account.class.updateEntitlements(type, quantity, subscriptionID)

  await ctx.account?.class.updateEntitlements(type, quantity, subscriptionID)
}
