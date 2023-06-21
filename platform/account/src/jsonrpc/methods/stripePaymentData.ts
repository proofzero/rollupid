import { z } from 'zod'
import { Context } from '../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initAccountNodeByName } from '../../nodes'

export const GetStripePaymentDataOutputSchema = z
  .object({
    customerID: z.string(),
    paymentMethodID: z.string().optional(),
  })
  .optional()
type GetStripePaymentDataOutput = z.infer<
  typeof GetStripePaymentDataOutputSchema
>

export const getStripePaymentData = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetStripePaymentDataOutput> => {
  return ctx.account?.class.getStripePaymentData()
}

export const SetStripePaymentDataInputSchema = z.object({
  customerID: z.string(),
  paymentMethodID: z.string().optional(),
  accountURN: AccountURNInput,
})
type SetStripePaymentDataInput = z.infer<typeof SetStripePaymentDataInputSchema>

export const setStripePaymentData = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: SetStripePaymentDataInput
}): Promise<void> => {
  const account = await initAccountNodeByName(input.accountURN, ctx.Account)
  await account.class.setStripePaymentData({
    customerID: input.customerID,
    paymentMethodID: input.paymentMethodID,
  })
}
