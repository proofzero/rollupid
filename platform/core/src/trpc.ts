import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from './context'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const middleware = t.middleware
export const procedure = t.procedure
export const router = t.router
