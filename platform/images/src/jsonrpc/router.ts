import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'

import { Context } from '../context'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  upload: t.procedure.use(LogUsage).use(Analytics).mutation(uploadMethod),
  uploadImageBlob: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .mutation(uploadImageBlobMethod),
  getOgImage: t.procedure.use(LogUsage).use(Analytics).query(getOgImageMethod),
  getGradient: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .mutation(getGradientMethod),
})
