import { initTRPC } from '@trpc/server'

import { LogUsage } from '@proofzero/platform-middleware/log'
import { errorFormatter } from '@proofzero/utils/trpc'

import {
  sendOTPEmailMethodOutput,
  sendOTPMethod,
  sendOTPEmailMethodInput,
} from './methods/sendOTPEmail'

import {
  sendBillingEmailMethodOutput,
  sendBillingEmailMethodInput,
  sendBillingNotificationMethod,
} from './methods/sendBillingNotification'

import { Context } from '../context'
import {
  sendFailedPaymentNotificationMethod,
  SendFailedPaymentNotificationMethodInputSchema,
} from './methods/sendFailedPaymentNotification'
import {
  sendSuccesfullPaymentNotificationMethod,
  sendSuccesfullPaymentNotificationMethodInput,
} from './methods/sendSuccesfullPaymentNotification'
import {
  SendReconciliationNotificationBatchMethodInputSchema,
  sendReconciliationNotificationBatchMethod,
} from './methods/sendReconciliationNotificationBatch'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  sendOTP: t.procedure
    .use(LogUsage)
    .input(sendOTPEmailMethodInput)
    .output(sendOTPEmailMethodOutput)
    .mutation(sendOTPMethod),
  sendBillingNotification: t.procedure
    .use(LogUsage)
    .input(sendBillingEmailMethodInput)
    .output(sendBillingEmailMethodOutput)
    .mutation(sendBillingNotificationMethod),
  sendReconciliationNotificationBatch: t.procedure
    .use(LogUsage)
    .input(SendReconciliationNotificationBatchMethodInputSchema)
    .mutation(sendReconciliationNotificationBatchMethod),
  sendFailedPaymentNotification: t.procedure
    .use(LogUsage)
    .input(SendFailedPaymentNotificationMethodInputSchema)
    .mutation(sendFailedPaymentNotificationMethod),
  sendSuccesfullPaymentNotification: t.procedure
    .use(LogUsage)
    .input(sendSuccesfullPaymentNotificationMethodInput)
    .mutation(sendSuccesfullPaymentNotificationMethod),
})
