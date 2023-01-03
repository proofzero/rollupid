import { BaseMiddlewareFunction } from './types'

export const LogUsage: BaseMiddlewareFunction<unknown> = async ({
  next,
  path,
  type,
}) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start
  result.ok
    ? console.log('OK request timing:', { path, type, durationMs })
    : console.log('Non-OK request timing', { path, type, durationMs })
  return result
}
