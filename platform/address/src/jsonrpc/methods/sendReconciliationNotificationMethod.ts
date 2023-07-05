import { z } from 'zod'

import { Context } from '../../context'
import { ServicePlanType } from '@proofzero/types/account'
import { ReconciliationNotificationType } from '../../../../email/src/jsonrpc/methods/sendReconciliationNotification'

export const SendReconciliationNotificationInput = z.object({
  billingEmail: z.string(),
  apps: z.array(
    z.object({
      devEmail: z.string().optional(),
      plan: z.nativeEnum(ServicePlanType),
    })
  ),
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
  })

  for (const app of input.apps) {
    if (!app.devEmail) {
      continue
    }

    await ctx.emailClient.sendReconciliationNotification.query({
      email: app.devEmail,
      type: ReconciliationNotificationType.Dev,
    })
  }
}
