import { BaseMiddlewareFunction } from './types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { BaseContext } from '@kubelt/types'

export const InjectEdges: BaseMiddlewareFunction<
  {
    EDGES?: Fetcher
  } & BaseContext
> = ({ ctx, next }) => {
  if (!ctx.EDGES) throw new Error('No EDGES binding found in context')
  const edgesClient = createEdgesClient(ctx.EDGES)

  return next({
    ctx: {
      ...ctx,
      edgesClient,
    },
  })
}
