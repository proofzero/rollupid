import { z } from 'zod'

import { Context } from '../../context'

import { EmailThemePropsSchema } from '../../../../email/src/emailFunctions'

export const SendBillingNotificationInput = z.object({
  email: z.string(),
  name: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
})

type SendBillingNotificationParams = z.infer<
  typeof SendBillingNotificationInput
>

export const sendBillingNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendBillingNotificationParams
  ctx: Context
}) => {
  const { email, name, themeProps } = input

  await ctx.emailClient.sendBillingNotification.mutate({
    emailAddress: email,
    name: name,
    themeProps,
  })
}
