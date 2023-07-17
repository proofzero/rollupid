import { z } from 'zod'

import { Context } from '../../context'

import { EmailThemePropsSchema } from '@proofzero/platform/email/src/emailFunctions'
import { PlansSchema } from '@proofzero/platform/account/src/jsonrpc/methods/getEntitlements'

export const SendSuccessfulPaymentNotificationInput = z.object({
  email: z.string(),
  name: z.string(),
  themeProps: EmailThemePropsSchema.optional(),
  plans: PlansSchema,
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
