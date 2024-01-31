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

export const SendReconciliationNotificationBatchMethodInputSchema = z.array(
  z.object({
    email: z.string(),
    type: z.nativeEnum(ReconciliationNotificationType),
    planType: z.string().optional(),
    count: z.number().optional(),
    billingURL: z.string(),
    settingsURL: z.string(),
    appName: z.string().optional(),
  })
)
export type SendReconciliationNotificationBatchMethodInput = z.infer<
  typeof SendReconciliationNotificationBatchMethodInputSchema
>

export const sendReconciliationNotificationBatchMethod = async ({
  input,
  ctx,
}: {
  input: SendReconciliationNotificationBatchMethodInput
  ctx: Context
}) => {
  await Promise.all(
    input.map(async (appModel) => {
      let emailContent
      switch (appModel.type) {
        case ReconciliationNotificationType.Billing:
          if (!appModel.planType || !appModel.count)
            throw new RollupError({
              message: `Invalid input: ${JSON.stringify(input)}`,
            })

          emailContent = getBillingReconciliationEmailContent(
            [
              {
                type: appModel.planType,
                count: appModel.count,
              },
            ],
            appModel.billingURL
          )
          break
        case ReconciliationNotificationType.Dev:
          if (!appModel.appName) {
            throw new RollupError({
              message: `Invalid input: ${JSON.stringify(appModel)}`,
            })
          }

          emailContent = getDevReconciliationEmailContent(
            appModel.appName,
            'Free Plan',
            appModel.settingsURL
          )
          break
        default:
          throw new RollupError({
            message: `Invalid notification type: ${appModel.type}`,
          })
      }

      const { env, notification } = getEmailContent({
        ctx,
        address: appModel.email,
        name: appModel.email,
        emailContent,
      })

      await sendNotification(notification, env)
    })
  )
}
