import { z } from 'zod'
import { inputValidators } from '@kubelt/platform-middleware'
import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'
import { AddressesSchema } from '../validators/profile'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
})

export const GetAddressesOutput = AddressesSchema.nullable()

export type GetAddressesOutputParams = z.infer<typeof GetAddressesOutput>

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<GetAddressesOutputParams> => {
  const node = await initAccountNodeByName(input.account, ctx.Account)

  const addresses = await node.class.getAddresses()

  if (!addresses) return null

  return addresses
}
