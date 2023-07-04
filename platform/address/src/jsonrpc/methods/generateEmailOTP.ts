import generateRandomString from '@proofzero/utils/generateRandomString'
import { z } from 'zod'

import { Context } from '../../context'
import { AddressNode } from '../../nodes'
import EmailAddress from '../../nodes/email'

import { EMAIL_VERIFICATION_OPTIONS } from '../../constants'
import { EmailThemePropsSchema } from '../../../../email/src/emailFunctions'

export const GenerateEmailOTPInput = z.object({
  email: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
  preview: z.boolean().optional(),
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
  const { email, themeProps, preview } = input
  const emailAddressNode = new EmailAddress(ctx.address as AddressNode, ctx)

  const state = generateRandomString(EMAIL_VERIFICATION_OPTIONS.STATE_LENGTH)

  const delayMiliseconds = preview ? 15000 : undefined
  const code = await emailAddressNode.generateVerificationCode(
    state,
    delayMiliseconds
  )

  await ctx.emailClient.sendOTP.mutate({
    emailAddress: email,
    name: email,
    otpCode: code,
    themeProps,
  })
  return state
}
