import { z } from 'zod'

import { Context } from '../../context'
import { ServicePlanType } from '@proofzero/types/account'
import { ReconciliationNotificationType } from '@proofzero/types/email'

export const SendReconciliationNotificationInput = z.object({
  planType: z.string(),
  count: z.number(),
  billingEmail: z.string(),
  apps: z.array(
    z.object({
      appName: z.string(),
      devEmail: z.string().optional(),
      plan: z.nativeEnum(ServicePlanType),
    })
  ),
  billingURL: z.string(),
  settingsURL: z.string(),
})
type SendReconciliationNotificationParams = z.infer<
  typeof SendReconciliationNotificationInput
>

export const sendReconciliationNotificationMethod = async ({
  input,
  ctx,
}: {
  input: SendReconciliationNotificationParams
  ctx: Context
}) => {
  await ctx.emailClient.sendReconciliationNotification.query({
    email: input.billingEmail,
    type: ReconciliationNotificationType.Billing,
    planType: input.planType,
    count: input.count,
    billingURL: input.billingURL,
    settingsURL: input.settingsURL,
  })

  await Promise.all(
    input.apps
      .filter((a) => Boolean(a.devEmail))
      .map((app) => {
        ctx.emailClient.sendReconciliationNotification.query({
          email: app.devEmail!,
          type: ReconciliationNotificationType.Dev,
          appName: app.appName,
          billingURL: input.billingURL,
          settingsURL: input.settingsURL,
        })
      })
  )
}
