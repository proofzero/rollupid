import { initTRPC } from '@trpc/server'
import { z } from 'zod'

import { jwt, geo } from '@kubelt/platform-middleware'

import { Context } from '../context'

import { initMethod, initMethodInput } from './methods/init'
import { delayInitMethod, delayInitMethodInput } from './methods/delayInit'
import { pingMethod, pingMethodInput } from './methods/ping'
import { pongMethod, pongMethodInput } from './methods/pong'

import { LogUsage } from '@kubelt/platform-middleware/log'

const t = initTRPC.context<Context>().create()

const messageIO = z.object({
  delay: z.number(),
  message: z.string(),
})

const delayIO = z.object({
  delay: z.number(),
  message: z.string(),
})

export const appRouter = t.router({
  init: t.procedure
    .use(geo.cfGeoContext)
    .use(LogUsage)
    .input(messageIO)
    .output(messageIO)
    .query(initMethod),
  delayinit: t.procedure
    .use(LogUsage)
    .input(delayIO)
    .output(delayIO)
    .mutation(delayInitMethod),
  ping: t.procedure.use(LogUsage).output(messageIO).mutation(pingMethod),
  pong: t.procedure.use(LogUsage).mutation(pongMethod),
})
