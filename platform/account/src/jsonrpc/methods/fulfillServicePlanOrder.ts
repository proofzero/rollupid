import { z } from 'zod'
import { Context } from '../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initAccountNodeByName } from '../../nodes'

export const FulfillServicePlanOrderInputSchema = z.object({
  nonce: z.string(),
  accountURN: AccountURNInput,
  subscriptionID: z.string(),
})
export type FulfillServicePlanOrderInput = z.infer<
  typeof FulfillServicePlanOrderInputSchema
>

export const fulfillServicePlanOrder = async ({
  input,
  ctx,
}: {
  input: FulfillServicePlanOrderInput
  ctx: Context
}): Promise<void> => {
  const { nonce, accountURN, subscriptionID } = input

  const account = await initAccountNodeByName(accountURN, ctx.Account)
  await account.class.fullfillServicePlanOrder(nonce, subscriptionID)
}
