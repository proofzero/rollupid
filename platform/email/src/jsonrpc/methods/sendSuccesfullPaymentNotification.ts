import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getEmailContent,
  getSuccessfulPaymentEmailContent,
} from '../../emailFunctions'
import { EmailThemePropsSchema } from '../../emailFunctions'
import { PlansSchema } from '@proofzero/platform.identity/src/jsonrpc/methods/getEntitlements'

export const EmailPlansSchema = z.array(
  z.object({
    name: z.string(),
    quantity: z.number(),
  })
)

export type EmailPlans = z.infer<typeof EmailPlansSchema>

export const sendSuccesfullPaymentNotificationMethodInput = z.object({
  name: z.string(),
  email: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
  plans: EmailPlansSchema,
})

export type sendSuccesfullPaymentNotificationMethodParams = z.infer<
  typeof sendSuccesfullPaymentNotificationMethodInput
>

export const sendSuccesfullPaymentNotificationMethodOutput = z.void()

export type sendSuccesfullPaymentNotificationMethodOutputParams = z.infer<
  typeof sendSuccesfullPaymentNotificationMethodOutput
>

export const sendSuccesfullPaymentNotificationMethod = async ({
  input,
  ctx,
}: {
  input: sendSuccesfullPaymentNotificationMethodParams
  ctx: Context
}): Promise<sendSuccesfullPaymentNotificationMethodOutputParams> => {
  const subscriptionEmailTemplate = getSuccessfulPaymentEmailContent({
    plans: input.plans,
    params: input.themeProps,
  })

  const { env, notification, customSender } = getEmailContent({
    ctx,
    address: input.email,
    name: input.name,
    emailContent: subscriptionEmailTemplate,
    themeProps: input.themeProps,
  })

  await sendNotification(notification, env, customSender)
}
