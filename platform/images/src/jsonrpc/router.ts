import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'
import {
  uploadMethod,
  uploadMethodOutput,
  uploadMethodInput,
} from './methods/upload'
import {
  getOgImageMethod,
  getOgImageMethodInput,
  getOgImageMethodOutput,
} from './methods/getOgImage'
import {
  getGradientMethod,
  GetGradientMethodInput,
  GetGradientMethodOutput,
} from './methods/getGradient'
import {
  updateOgImageMethodInput,
  updateOgImageMethodOutput,
  updateOgImageMethod,
} from './methods/updateOgImage'

import { Context } from '../context'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  upload: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(uploadMethodInput)
    .output(uploadMethodOutput)
    .mutation(uploadMethod),
  getOgImage: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(getOgImageMethodInput)
    .output(getOgImageMethodOutput)
    .query(getOgImageMethod),
  updateOgImage: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(updateOgImageMethodInput)
    .output(updateOgImageMethodOutput)
    .query(updateOgImageMethod),
  getGradient: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetGradientMethodInput)
    .output(GetGradientMethodOutput)
    .mutation(getGradientMethod),
})
