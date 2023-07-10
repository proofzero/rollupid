import { z } from 'zod'
import { Context } from '../../context'
import {
  sendNotification,
  getEmailContent,
  getBillingReconciliationEmailContent,
  getDevReconciliationEmailContent,
} from '../../emailFunctions'
import { RollupError } from '@proofzero/errors'
import { ReconciliationNotificationType } from '@proofzero/types/email'

export const SendReconciliationNotificationMethodInputSchema = z.object({
  email: z.string(),
  type: z.nativeEnum(ReconciliationNotificationType),
  planType: z.string().optional(),
  count: z.number().optional(),
  billingURL: z.string(),
  settingsURL: z.string(),
  appName: z.string().optional(),
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
      if (!input.planType || !input.count)
        throw new RollupError({
          message: `Invalid input: ${JSON.stringify(input)}`,
        })

      emailContent = getBillingReconciliationEmailContent(
        [
          {
            type: input.planType,
            count: input.count,
          },
        ],
        input.billingURL
      )
      break
    case ReconciliationNotificationType.Dev:
      if (!input.appName) {
        throw new RollupError({
          message: `Invalid input: ${JSON.stringify(input)}`,
        })
      }

      emailContent = getDevReconciliationEmailContent(
        input.appName,
        'Free Plan',
        input.settingsURL
      )
      break
    default:
      throw new RollupError({
        message: `Invalid notification type: ${type}`,
      })
  }

  const { env, notification } = getEmailContent({
    ctx,
    address: email,
    name: email,
    emailContent,
  })

  await sendNotification(notification, env)
}
