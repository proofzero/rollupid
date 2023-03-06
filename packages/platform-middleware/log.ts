import { BaseContext } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'

export const LogUsage: BaseMiddlewareFunction<BaseContext> = async ({
  next,
  path,
  type,
  ctx,
}) => {
  console.debug(
    `Starting tRPC handler for ${type} ${path} span: ${ctx.traceSpan}`
  )
  const result = await next()
  console.debug(
    `Completed tRPC handler for ${type} ${path} span: ${ctx.traceSpan}`
  )
  return result
}
