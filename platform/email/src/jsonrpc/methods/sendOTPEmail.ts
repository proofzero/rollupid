import { z } from 'zod'
import { Context } from '../../context'
import { sendNotification, getOTPEmailContent } from '../../emailFunctions'
import { EmailNotification } from '../../types'
import { Environment } from '../../types'

export const sendOTPEmailMethodInput = z.object({
  name: z.string(),
  emailAddress: z.string(),
  otpCode: z.string(),
})

export type sendOTPEmailMethodParams = z.infer<typeof sendOTPEmailMethodInput>

export const sendOTPEmailMethodOutput = z.void()

export type sendOTPEmailMethodOutputParams = z.infer<
  typeof sendOTPEmailMethodOutput
>

export const sendEmailNotificationMethod = async ({
  input,
  ctx,
}: {
  input: sendOTPEmailMethodParams
  ctx: Context
}): Promise<sendOTPEmailMethodOutputParams> => {
  if (
    !(
      ctx.DefaultEmailFromAddress &&
      ctx.DefaultEmailFromName &&
      ctx.DKIMDomain &&
      ctx.DKIMPrivateKey &&
      ctx.DKIMSelector
    )
  )
    throw new Error(
      'Environment variables not set correctly to be able to send emails.'
    )

  const env: Environment = {
    DefaultEmailFromAddress: ctx.DefaultEmailFromAddress,
    DefaultEmailFromName: ctx.DefaultEmailFromAddress,
    DKIMDomain: ctx.DKIMDomain,
    DKIMPrivateKey: ctx.DKIMPrivateKey,
    DKIMSelector: ctx.DKIMSelector,
  }

  const otpEmailTemplate = getOTPEmailContent(input.otpCode)
  const notification: EmailNotification = {
    content: otpEmailTemplate,
    recipient: {
      name: input.name,
      address: input.emailAddress,
    },
  }

  await sendNotification(notification, env)
}
