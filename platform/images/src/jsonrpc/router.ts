import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'
import {
  uploadMethod,
  uploadMethodOutput,
  uploadMethodInput,
} from './methods/upload'
import {
  uploadImageBlobMethod,
  uploadImageBlobInput,
  uploadImageBlobMethodOutput,
} from './methods/uploadImageBlob'
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

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  upload: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(uploadMethodInput)
    .output(uploadMethodOutput)
    .mutation(uploadMethod),
  uploadImageBlob: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(uploadImageBlobInput)
    .output(uploadImageBlobMethodOutput)
    .mutation(uploadImageBlobMethod),
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
