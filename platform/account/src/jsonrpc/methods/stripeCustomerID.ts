import { z } from 'zod'
import { Context } from '../../context'

export const GetStripeCustomerIDOutputSchema = z.string().optional()
type GetStripeCustomerIDOutput = z.infer<typeof GetStripeCustomerIDOutputSchema>

export const getStripeCustomerID = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetStripeCustomerIDOutput> => {
  return ctx.account?.class.getStripeCustomerID()
}

export const SetStripeCustomerIDInputSchema = z.string()
type SetStripeCustomerIDInput = z.infer<typeof SetStripeCustomerIDInputSchema>

export const setStripeCustomerID = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: SetStripeCustomerIDInput
}): Promise<void> => {
  await ctx.account?.class.setStripeCustomerID(input)
}
