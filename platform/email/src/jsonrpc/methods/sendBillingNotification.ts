import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getSubscriptionEmailContent,
  getEmailContent,
} from '../../emailFunctions'
import { EmailThemePropsSchema } from '../../emailFunctions'

export const sendBillingEmailMethodInput = z.object({
  name: z.string(),
  emailAddress: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
})

export type sendBillingEmailMethodParams = z.infer<
  typeof sendBillingEmailMethodInput
>

export const sendBillingEmailMethodOutput = z.void()

export type sendBillingEmailMethodOutputParams = z.infer<
  typeof sendBillingEmailMethodOutput
>

export const sendBillingNotificationMethod = async ({
  input,
  ctx,
}: {
  input: sendBillingEmailMethodParams
  ctx: Context
}): Promise<sendBillingEmailMethodOutputParams> => {
  const subscriptionEmailTemplate = getSubscriptionEmailContent(
    input.themeProps
  )

  const { env, notification, customSender } = getEmailContent({
    ctx,
    address: input.emailAddress,
    name: input.name,
    emailContent: subscriptionEmailTemplate,
    themeProps: input.themeProps,
  })

  await sendNotification(notification, env, customSender)
}
