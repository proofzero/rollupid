import { z } from 'zod'

import { BadRequestError } from '@proofzero/errors'
import { EmailAccountType, OAuthAccountType } from '@proofzero/types/account'

import { Context } from '../../context'
import EmailAccount from '../../nodes/email'

export const GetMaskedAddressInput = z.object({
  clientId: z.string(),
})
export const GetMaskedAddressOutput = z.string()

type GetMaskedAddressInput = z.infer<typeof GetMaskedAddressInput>
type GetMaskedAddressOutput = z.infer<typeof GetMaskedAddressOutput>

type GetMaskedAddressParams = {
  ctx: Context
  input: GetMaskedAddressInput
}

interface GetMaskedAddressMethod {
  (params: GetMaskedAddressParams): Promise<GetMaskedAddressOutput>
}

export const getMaskedAddressMethod: GetMaskedAddressMethod = async ({
  ctx,
  input,
}) => {
  if (!ctx.account) throw new BadRequestError({ message: 'missing account' })

  const accountType = await ctx.account.class.getType()
  switch (accountType) {
    case EmailAccountType.Email:
    case OAuthAccountType.Apple:
    case OAuthAccountType.Google:
    case OAuthAccountType.Microsoft:
      break
    default:
      throw new BadRequestError({ message: 'invalid account type' })
  }

  const node = new EmailAccount(ctx.account, ctx.env)
  return node.getMaskedAddress(
    input.clientId,
    ctx.env.INTERNAL_RELAY_DISTRIBUTION_KEY
  )
}
