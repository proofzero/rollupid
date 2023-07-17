import { z } from 'zod'

import { Context } from '../../context'

import { EmailThemePropsSchema } from '@proofzero/platform/email/src/emailFunctions'

export const SendFailedPaymentNotificationInput = z.object({
  email: z.string(),
  name: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
})

type SendFailedPaymentNotificationParams = z.infer<
  typeof SendFailedPaymentNotificationInput
>

export const sendFailedPaymentNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendFailedPaymentNotificationParams
  ctx: Context
}) => {
  const { email, name, themeProps } = input

  await ctx.emailClient.sendFailedPaymentNotification.mutate({
    email: email,
    name: name,
    themeProps,
  })
}
