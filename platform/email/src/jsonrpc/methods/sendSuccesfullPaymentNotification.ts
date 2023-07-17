import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getEmailContent,
  getSuccessfulPaymentEmailContent,
} from '../../emailFunctions'
import { EmailThemePropsSchema } from '../../emailFunctions'
import { PlansSchema } from '@proofzero/platform/account/src/jsonrpc/methods/getEntitlements'

export const sendSuccesfullPaymentNotificationMethodInput = z.object({
  name: z.string(),
  email: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
  plans: PlansSchema,
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
    plans: input.plans as typeof PlansSchema,
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
