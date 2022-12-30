import { BaseMiddlewareFunction } from './types'

export const Scopes: BaseMiddlewareFunction<unknown> = async ({
  ctx,
  next,
}) => {
  console.warn('Scopes middleware not implemented yet')
  return next({ ctx })
}
