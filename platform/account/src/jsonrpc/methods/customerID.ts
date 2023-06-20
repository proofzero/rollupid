import { z } from 'zod'
import { Context } from '../../context'

export const GetCustomerIDOutputSchema = z.string().optional()
type GetCustomerIDOutput = z.infer<typeof GetCustomerIDOutputSchema>

export const getCustomerID = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetCustomerIDOutput> => {
  return ctx.account?.class.getCustomerID()
}

export const SetCustomerIDInputSchema = z.string()
type SetCustomerIDInput = z.infer<typeof SetCustomerIDInputSchema>

export const setCustomerID = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: SetCustomerIDInput
}): Promise<void> => {
  await ctx.account?.class.setCustomerID(input)
}
