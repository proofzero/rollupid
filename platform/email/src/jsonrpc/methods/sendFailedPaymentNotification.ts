import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getEmailContent,
  getFailedPaymentEmailContent,
  EmailThemePropsSchema,
} from '../../emailFunctions'

export const SendFailedPaymentNotificationMethodInputSchema = z.object({
  name: z.string(),
  email: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
})

export type SendFailedPaymentNotificationMethodInput = z.infer<
  typeof SendFailedPaymentNotificationMethodInputSchema
>

export const sendFailedPaymentNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendFailedPaymentNotificationMethodInput
  ctx: Context
}) => {
  const emailContent = getFailedPaymentEmailContent(input.themeProps)

  const { env, notification, customSender } = getEmailContent({
    ctx,
    address: input.email,
    name: input.name,
    emailContent,
  })

  await sendNotification(notification, env, customSender)
}
