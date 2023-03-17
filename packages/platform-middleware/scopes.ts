import { BaseContext } from '@proofzero/types'
import { BaseMiddlewareFunction } from './types'

export const Scopes: BaseMiddlewareFunction<BaseContext> = async ({
  ctx,
  next,
}) => {
  //TODO: Implement scopes middleware
  return next({ ctx })
}
