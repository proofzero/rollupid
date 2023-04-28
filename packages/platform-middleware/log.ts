import { BaseContext } from '@proofzero/types'
import { BaseMiddlewareFunction } from './types'

export const LogUsage: BaseMiddlewareFunction<BaseContext> = async ({
  next,
  path,
  type,
  ctx,
}) => {
  console.debug(
    `Starting tRPC handler for ${type} ${path}`,
    ctx.traceSpan?.toString()
  )
  const result = await next()
  console.debug(
    `Completed tRPC handler for ${type} ${path}`,
    ctx.traceSpan?.toString()
  )
  return result
}
