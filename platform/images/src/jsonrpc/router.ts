import { initTRPC } from '@trpc/server'

import { Analytics } from '@proofzero/platform-middleware/analytics'
import { LogUsage } from '@proofzero/platform-middleware/log'
import { errorFormatter } from '@proofzero/utils/trpc'

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

import { Context } from '../context'

const t = initTRPC.context<Context>().create({ errorFormatter })

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
  getGradient: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetGradientMethodInput)
    .output(GetGradientMethodOutput)
    .mutation(getGradientMethod),
})
