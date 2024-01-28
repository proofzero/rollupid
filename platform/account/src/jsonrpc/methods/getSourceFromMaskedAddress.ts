import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { Context } from '../../context'
import { EmailAccountType } from '@proofzero/types/account'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@proofzero/errors'
import { generateHashedIDRef } from '@proofzero/packages/urns/idref'
import { EmailAccount, initAccountNodeByName } from '../../nodes'

export const GetSourceByMaskedAddressInput = z.object({
  maskedEmail: z.string(),
})

export const GetSourceByMaskedAddressOutput = z.object({
  nickname: z.string(),
  sourceEmail: z.string(),
})

type GetSourceByMaskedAddressParams = z.infer<
  typeof GetSourceByMaskedAddressInput
>
type GetSourceByMaskedAddressResult = z.infer<
  typeof GetSourceByMaskedAddressOutput
>

export const getSourceFromMaskedAddressMethod = async ({
  input,
  ctx,
}: {
  input: GetSourceByMaskedAddressParams
  ctx: Context
}): Promise<GetSourceByMaskedAddressResult> => {
  const nss = generateHashedIDRef(EmailAccountType.Mask, input.maskedEmail)
  const urn = AccountURNSpace.componentizedUrn(nss)
  const node = initAccountNodeByName(urn, ctx.env.Account)

  const emailNode = new EmailAccount(node, ctx.env)
  const sourceAccountURN = await emailNode.getSourceAccount()
  if (!sourceAccountURN)
    throw new NotFoundError({
      message: `Could not find hidden address ${input.maskedEmail}`,
    })

  const sourceAccountNode = initAccountNodeByName(
    sourceAccountURN,
    ctx.env.Account
  )

  const name = (await sourceAccountNode.class.getNickname()) || ''
  const address = await sourceAccountNode.class.getAddress()

  if (!address)
    throw new InternalServerError({
      message: `Could not find source address for masked email ${input.maskedEmail}`,
    })

  return { sourceEmail: address, nickname: name }
}
