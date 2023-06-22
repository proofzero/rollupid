import { z } from 'zod'
import { Context } from '../../context'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { initAccountNodeByName } from '../../nodes'

export const GetStripPaymentDataInputSchema = z.object({
  accountURN: AccountURNInput,
})
type GetStripPaymentDataInput = z.infer<typeof GetStripPaymentDataInputSchema>

export const GetStripePaymentDataOutputSchema = z
  .object({
    customerID: z.string(),
    email: z.string(),
    name: z.string(),
    paymentMethodID: z.string().optional(),
  })
  .optional()
type GetStripePaymentDataOutput = z.infer<
  typeof GetStripePaymentDataOutputSchema
>

export const getStripePaymentData = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: GetStripPaymentDataInput
}): Promise<GetStripePaymentDataOutput> => {
  const account = await initAccountNodeByName(input.accountURN, ctx.Account)

  return account.class.getStripePaymentData()
}

export const SetStripePaymentDataInputSchema = z.object({
  customerID: z.string(),
  paymentMethodID: z.string().optional(),
  accountURN: AccountURNInput,
  email: z.string(),
  name: z.string(),
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

  const { customerID, paymentMethodID, email, name } = input
  await account.class.setStripePaymentData({
    customerID,
    paymentMethodID,
    email,
    name,
  })
}
