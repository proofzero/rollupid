import generateRandomString from '@proofzero/utils/generateRandomString'
import { z } from 'zod'

import { Context } from '../../context'
import { AddressNode } from '../../nodes'
import EmailAddress from '../../nodes/email'

import { EMAIL_VERIFICATION_OPTIONS } from '../../constants'

export const GenerateEmailOTPInput = z.object({
  address: z.string(),
})

export const GenerateEmailOTPOutput = z.string()

type GenerateEmailOTPParams = z.infer<typeof GenerateEmailOTPInput>

export const generateEmailOTPMethod = async ({
  input,
  ctx,
}: {
  input: GenerateEmailOTPParams
  ctx: Context
}): Promise<string> => {
  const { address } = input
  const emailAddressNode = new EmailAddress(ctx.address as AddressNode, ctx)

  const state = generateRandomString(EMAIL_VERIFICATION_OPTIONS.STATE_LENGTH)
  const code = await emailAddressNode.generateVerificationCode(state)
  await ctx.emailClient.sendEmailNotification.mutate({
    emailAddress: address,
    name: address,
    otpCode: code,
  })
  return state
}
