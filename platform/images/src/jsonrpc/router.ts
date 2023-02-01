import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'
import { uploadMethod, uploadMethodOutput } from './methods/upload'
import {
  uploadImageBlobMethod,
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
  GetGradienteMethodOutput,
} from './methods/getGradient'

import { Context } from '../context'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  upload: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .output(uploadMethodOutput)
    .mutation(uploadMethod),
  uploadImageBlob: t.procedure
    .use(LogUsage)
    .use(Analytics)
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
    .output(GetGradienteMethodOutput)
    .mutation(getGradientMethod),
})
