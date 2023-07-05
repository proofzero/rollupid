import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getEmailContent,
  getBillingReconciliationEmailContent,
  getDevReconciliationEmailContent,
} from '../../emailFunctions'
import { RollupError } from '@proofzero/errors'

export enum ReconciliationNotificationType {
  Billing = 'BILLING',
  Dev = 'DEV',
}

export const SendReconciliationNotificationMethodInputSchema = z.object({
  email: z.string(),
  type: z.nativeEnum(ReconciliationNotificationType),
})
export type SendReconciliationNotificationMethodInput = z.infer<
  typeof SendReconciliationNotificationMethodInputSchema
>

export const sendReconciliationNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendReconciliationNotificationMethodInput
  ctx: Context
}) => {
  const { email, type } = input

  let emailContent
  switch (type) {
    case ReconciliationNotificationType.Billing:
      emailContent = getBillingReconciliationEmailContent()
      break
    case ReconciliationNotificationType.Dev:
      emailContent = getDevReconciliationEmailContent()
      break
    default:
      throw new RollupError({
        message: `Invalid notification type: ${type}`,
      })
  }

  const { env, notification, customSender } = getEmailContent({
    ctx,
    address: email,
    name: 'Foo',
    emailContent,
  })

  await sendNotification(notification, env, customSender)
}
