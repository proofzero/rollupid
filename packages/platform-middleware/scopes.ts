import { BaseContext } from '@kubelt/types'
import { BaseMiddlewareFunction } from './types'

export const Scopes: BaseMiddlewareFunction<BaseContext> = async ({
  ctx,
  next,
}) => {
  console.warn('Scopes middleware not implemented yet')
  return next({ ctx })
}
