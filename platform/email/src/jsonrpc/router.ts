import { initTRPC } from '@trpc/server'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { errorFormatter } from '@proofzero/utils/trpc'

import {
  sendOTPEmailMethodOutput,
  sendEmailNotificationMethod,
  sendOTPEmailMethodInput,
} from './methods/sendOTPEmail'

import {
  sendBillingEmailMethodOutput,
  sendBillingEmailMethodInput,
  sendBillingNotificationMethod,
} from './methods/sendBillingNotification'

import { Context } from '../context'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  sendEmailNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(sendOTPEmailMethodInput)
    .output(sendOTPEmailMethodOutput)
    .mutation(sendEmailNotificationMethod),
  sendBillingNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(sendBillingEmailMethodInput)
    .output(sendBillingEmailMethodOutput)
    .mutation(sendBillingNotificationMethod),
})
