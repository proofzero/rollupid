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
      ctx.NotificationFromUser &&
      ctx.NotificationFromName &&
      ctx.INTERNAL_DKIM_DOMAIN &&
      ctx.KEY_DKIM_PRIVATEKEY &&
      ctx.INTERNAL_DKIM_SELECTOR
    )
  )
    throw new Error(
      'Environment variables not set correctly to be able to send emails.'
    )

  const env: Environment = {
    NotificationFromUser: ctx.NotificationFromUser,
    NotificationFromName: ctx.NotificationFromName,
    INTERNAL_DKIM_DOMAIN: ctx.INTERNAL_DKIM_DOMAIN,
    KEY_DKIM_PRIVATEKEY: ctx.KEY_DKIM_PRIVATEKEY,
    INTERNAL_DKIM_SELECTOR: ctx.INTERNAL_DKIM_SELECTOR,
    SECRET_TEST_API_TEST_TOKEN: ctx.SECRET_TEST_API_TEST_TOKEN,
    Test: ctx.Test,
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
