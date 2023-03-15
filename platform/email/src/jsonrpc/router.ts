import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'
import {
  sendOTPEmailMethodOutput,
  sendEmailNotificationMethod,
  sendOTPEmailMethodInput,
} from './methods/sendOTPEmail'
import { Context } from '../context'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  sendEmailNotification: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(sendOTPEmailMethodInput)
    .output(sendOTPEmailMethodOutput)
    .mutation(sendEmailNotificationMethod),
})
