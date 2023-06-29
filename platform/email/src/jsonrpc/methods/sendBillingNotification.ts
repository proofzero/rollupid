import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  NotificationSender,
  getSubscriptionEmailContent,
} from '../../emailFunctions'
import { Environment, EmailNotification, EmailContentType } from '../../types'
import { InternalServerError } from '@proofzero/errors'

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
    throw new InternalServerError({
      message:
        'Environment variables not set correctly to be able to send emails.',
    })

  const env: Environment = {
    NotificationFromUser: ctx.NotificationFromUser,
    NotificationFromName: ctx.NotificationFromName,
    INTERNAL_DKIM_DOMAIN: ctx.INTERNAL_DKIM_DOMAIN,
    KEY_DKIM_PRIVATEKEY: ctx.KEY_DKIM_PRIVATEKEY,
    INTERNAL_DKIM_SELECTOR: ctx.INTERNAL_DKIM_SELECTOR,
    SECRET_TEST_API_TEST_TOKEN: ctx.SECRET_TEST_API_TEST_TOKEN,
    Test: ctx.Test,
  }

  const subscriptionEmailTemplate = getSubscriptionEmailContent()

  const notification: EmailNotification = {
    content: subscriptionEmailTemplate,
    recipient: {
      name: input.name,
      address: input.emailAddress,
    },
  }

  let customSender: NotificationSender

  await sendNotification(notification, env, customSender)
}
