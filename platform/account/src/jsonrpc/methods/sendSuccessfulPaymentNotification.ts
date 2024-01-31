import { z } from 'zod'

import { Context } from '../../context'

import { EmailThemePropsSchema } from '@proofzero/platform/email/src/emailFunctions'
import { EmailPlansSchema } from '@proofzero/platform/email/src/jsonrpc/methods/sendSuccesfullPaymentNotification'

export const SendSuccessfulPaymentNotificationInput = z.object({
  email: z.string(),
  name: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
  plans: EmailPlansSchema,
})

type SendSuccessfulPaymentNotificationParams = z.infer<
  typeof SendSuccessfulPaymentNotificationInput
>

export const sendSuccessfulPaymentNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendSuccessfulPaymentNotificationParams
  ctx: Context
}) => {
  const { email, name, themeProps, plans } = input

  await ctx.emailClient.sendSuccesfullPaymentNotification.mutate({
    email,
    name,
    themeProps,
    plans: plans,
  })
}
