import { initTRPC } from '@trpc/server'
import { ZodError } from 'zod'

import { jwt, geo } from '@kubelt/platform-middleware'

import { Context } from '../context'

// import { getProfileMethod, GetProfileInput } from './methods/getProfile'
// import { setProfileMethod, SetProfileInput } from './methods/setProfile'
import { Scopes } from '@kubelt/platform-middleware/scopes'
import { LogUsage } from '@kubelt/platform-middleware/log'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  getProfile: t.procedure
    .use(Scopes)
    .use(geo.cfGeoContext)
    .use(LogUsage)
    .input(GetProfileInput)
    .output(Profile)
    .query(getProfileMethod),
  setProfile: t.procedure
    .use(Scopes)
    .use(LogUsage)
    .input(SetProfileInput)
    .mutation(setProfileMethod),
})

export type PingRouter = typeof appRouter
