import { initTRPC } from '@trpc/server'

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
import {
  DeleteMethodInputSchema,
  DeleteMethodOutputSchema,
  deleteMethod,
} from './methods/delete'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  upload: t.procedure
    .use(LogUsage)
    .input(uploadMethodInput)
    .output(uploadMethodOutput)
    .mutation(uploadMethod),
  delete: t.procedure
    .use(LogUsage)
    .input(DeleteMethodInputSchema)
    .output(DeleteMethodOutputSchema)
    .mutation(deleteMethod),
  getOgImage: t.procedure
    .use(LogUsage)
    .input(getOgImageMethodInput)
    .output(getOgImageMethodOutput)
    .query(getOgImageMethod),
  getGradient: t.procedure
    .use(LogUsage)
    .input(GetGradientMethodInput)
    .output(GetGradientMethodOutput)
    .mutation(getGradientMethod),
})
