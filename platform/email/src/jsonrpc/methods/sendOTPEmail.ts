import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getOTPEmailContent,
  NotificationSender,
} from '../../emailFunctions'
import { EmailNotification } from '../../types'
import { Environment } from '../../types'

export const SendOTPEmailThemePropsSchema = z.object({
  privacyURL: z.string().url(),
  termsURL: z.string().url(),
  contactURL: z.string().url().optional(),
  address: z.string().optional(),
  logoURL: z.string().url().optional(),
  appName: z.string(),
  hostname: z.string().optional(),
})

export type SendOTPEmailThemeProps = z.infer<
  typeof SendOTPEmailThemePropsSchema
>

export const sendOTPEmailMethodInput = z.object({
  name: z.string(),
  emailAddress: z.string(),
  otpCode: z.string(),
  themeProps: SendOTPEmailThemePropsSchema.optional(),
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

  const otpEmailTemplate = getOTPEmailContent(input.otpCode, input.themeProps)
  const notification: EmailNotification = {
    content: otpEmailTemplate,
    recipient: {
      name: input.name,
      address: input.emailAddress,
    },
  }

  let customSender: NotificationSender
  if (input.themeProps?.hostname) {
    customSender = {
      address: `no-reply@${input.themeProps.hostname}`,
      name: input.themeProps.appName,
    }
  }

  await sendNotification(notification, env, customSender)
}
