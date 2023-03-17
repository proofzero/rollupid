import { initTRPC } from '@trpc/server'

import { geo } from '@proofzero/platform-middleware'

import { Context } from '../context'

import { initMethod, InitInputOutput } from './methods/init'
import { delayInitMethod, DelayInitInputOutput } from './methods/delayInit'
import { pingMethod, PingOutput } from './methods/ping'
import { pongMethod } from './methods/pong'

import { LogUsage } from '@proofzero/platform-middleware/log'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  init: t.procedure
    .use(geo.cfGeoContext)
    .use(LogUsage)
    .input(InitInputOutput)
    .output(InitInputOutput)
    .mutation(initMethod),
  delayinit: t.procedure
    .use(LogUsage)
    .input(DelayInitInputOutput)
    .output(DelayInitInputOutput)
    .mutation(delayInitMethod),
  ping: t.procedure.use(LogUsage).output(PingOutput).query(pingMethod),
  pong: t.procedure.use(LogUsage).query(pongMethod),
})
