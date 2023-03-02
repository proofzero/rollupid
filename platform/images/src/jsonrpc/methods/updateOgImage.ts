import { z } from 'zod'
import { Context } from '../../context'
import { appRouter } from '../router'

export const updateOgImageMethodInput = z.object({
  fgUrl: z.string().url(),
})
export type updateOgImageParams = z.infer<typeof updateOgImageMethodInput>

export const updateOgImageMethodOutput = z.string()
export type updateOgImageOutputParams = z.infer<
  typeof updateOgImageMethodOutput
>

export const updateOgImageMethod = async ({
  input,
  ctx,
}: {
  input: updateOgImageParams
  ctx: Context
}): Promise<updateOgImageOutputParams> => {
  const cache = caches.default

  await cache.delete(ctx.req!)

  const { fgUrl } = input
  const caller = appRouter.createCaller({
    ...ctx,
  })

  return caller.getOgImage({ fgUrl })
}
