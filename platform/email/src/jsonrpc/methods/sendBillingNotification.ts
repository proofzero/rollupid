import { z } from 'zod'
import { Context } from '../../context'
import { sendNotification, NotificationSender } from '../../emailFunctions'
import { Environment, EmailNotification, EmailContentType } from '../../types'

export const SendBillingEmailThemePropsSchema = z.object({
  privacyURL: z.string().url(),
  termsURL: z.string().url(),
  contactURL: z.string().url().optional(),
  address: z.string().optional(),
  logoURL: z.string().url().optional(),
  appName: z.string(),
  hostname: z.string().optional(),
})

export type SendBillingEmailThemeProps = z.infer<
  typeof SendBillingEmailThemePropsSchema
>

export const sendBillingEmailMethodInput = z.object({
  name: z.string(),
  emailAddress: z.string(),
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

  const notification: EmailNotification = {
    content: {
      subject: 'Payment Update Needed for Your Account',
      contentType: 'text/plain' as EmailContentType,
      body: `
      Dear ${input.name},

We hope this message finds you well. We're contacting you because the credit card we have on file for your account is set to expire soon.

To avoid any interruption to your services, we kindly ask that you update your payment information at your earliest convenience.

You can update your payment details by following these steps:

1. Log in to your account on our website.
2. Navigate to the "Billing" section.
3. Click on "Update Payment Method".
4. Enter your new card details and click "Save".
5. If you have any questions or need further assistance, please don't hesitate to contact our support team.

Thank you for your prompt attention to this matter.

Best regards,

Rollup.Id`,
    },
    recipient: {
      name: input.name,
      address: input.emailAddress,
    },
  }

  let customSender: NotificationSender

  await sendNotification(notification, env, customSender)
}
