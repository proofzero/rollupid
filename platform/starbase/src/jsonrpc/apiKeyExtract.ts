import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'

import type { Context } from './context'
import { AppAPIKeyHeader } from '@proofzero/types/headers'

export const ApiKeyExtractMiddleware: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  const apiKey = ctx.req?.headers.get(AppAPIKeyHeader)

  if (apiKey) {
    return next({
      ctx: { ...ctx, apiKey },
    })
  } else {
    console.log('No API key found in request headers')
    return next({ ctx })
  }
}
