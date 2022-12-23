import { initTRPC } from '@trpc/server'
import { Context } from './context'

import { GetGalleryInput, getGalleryMethod } from './jsonrpc/methods/getGallery'

const t = initTRPC.context<Context>().create()

export const scopes = t.middleware(async ({ ctx, next }) => {
  // TODO: check scopes
  return next({ ctx })
})

export const logUsage = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start
  result.ok
    ? console.log('OK request timing:', { path, type, durationMs })
    : console.log('Non-OK request timing', { path, type, durationMs })
  return result
})

export const appRouter = t.router({
  getGallery: t.procedure
    .use(scopes)
    .use(logUsage)
    .input(GetGalleryInput)
    .query(getGalleryMethod),
})

export type AppRouter = typeof appRouter
