import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getOTPEmailContent,
  getEmailContent,
} from '../../emailFunctions'

import { EmailThemePropsSchema } from '../../emailFunctions'

export const sendOTPEmailMethodInput = z.object({
  name: z.string(),
  emailAddress: z.string(),
  otpCode: z.string(),
  state: z.string(),
  clientId: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
})

export type sendOTPEmailMethodParams = z.infer<typeof sendOTPEmailMethodInput>

export const sendOTPEmailMethodOutput = z.void()

export type sendOTPEmailMethodOutputParams = z.infer<
  typeof sendOTPEmailMethodOutput
>

export const sendOTPMethod = async ({
  input,
  ctx,
}: {
  input: sendOTPEmailMethodParams
  ctx: Context
}): Promise<sendOTPEmailMethodOutputParams> => {
  const otpEmailTemplate = getOTPEmailContent(
    input.otpCode,
    input.clientId,
    input.state,
    input.emailAddress,
    input.themeProps
  )
  const { env, notification, customSender } = getEmailContent({
    ctx,
    address: input.emailAddress,
    name: input.name,
    emailContent: otpEmailTemplate,
    themeProps: input.themeProps,
  })
  await sendNotification(notification, env, customSender)
}
