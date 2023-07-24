import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { inputValidators } from '@proofzero/platform-middleware'

import { Context } from '../../context'
import { AddressesSchema } from '../validators/profile'

export const GetAddressesInput = z.object({
  account: inputValidators.AccountURNInput,
  filter: z
    .object({
      type: inputValidators.CryptoAddressTypeInput.optional(),
    })
    .optional(),
})

export type GetAddressesParams = z.infer<typeof GetAddressesInput>

export const GetAddressesOutput = AddressesSchema.nullable()
export type GetAddressesOutputParams = z.infer<typeof GetAddressesOutput>

export const getAddressesMethod = async ({
  input,
  ctx,
}: {
  input: GetAddressesParams
  ctx: Context
}): Promise<GetAddressesOutputParams> => {
  const caller = router.createCaller(ctx)

  const getAddressesCall =
    ctx.accountURN === input.account
      ? caller.account.getOwnAddresses
      : caller.account.getPublicAddresses

  const addresses = await getAddressesCall({ account: input.account })

  return addresses
}
