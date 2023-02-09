import { Analytics } from '@kubelt/platform-middleware/analytics'
import { LogUsage } from '@kubelt/platform-middleware/log'
import { initTRPC } from '@trpc/server'
import {
  getOneTimeImageUploadURLMethod,
  getOneTimeImageUploadURLOutput,
  getOneTimeImageUploadURLInput,
} from './methods/getOneTimeImageUploadURL'
import {
  uploadImageMethod,
  uploadImageInput,
  uploadImageMethodOutput,
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
import {
  getPrecomputedImageURL,
  PrecomputedImageURLInput,
  PrecomputedImageURLOutput,
} from './methods/getPrecomputedImageURL'

const t = initTRPC.context<Context>().create()

export const appRouter = t.router({
  getOneTimeImageUploadURL: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(getOneTimeImageUploadURLInput)
    .output(getOneTimeImageUploadURLOutput)
    .query(getOneTimeImageUploadURLMethod),
  uploadImage: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(uploadImageInput)
    .output(uploadImageMethodOutput)
    .mutation(uploadImageMethod),
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
  getPrecomputedImageURL: t.procedure
    .use(LogUsage)
    .input(PrecomputedImageURLInput)
    .output(PrecomputedImageURLOutput)
    .query(getPrecomputedImageURL),
})
