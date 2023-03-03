import { BaseMiddlewareFunction } from './types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { BaseContext } from '@kubelt/types'

export const InjectEdges: BaseMiddlewareFunction<
  {
    Edges?: Fetcher
  } & BaseContext
> = ({ ctx, next }) => {
  if (!ctx.Edges) throw new Error('No Edges binding found in context')
  const edgesClient = createEdgesClient(ctx.Edges)

  return next({
    ctx: {
      ...ctx,
      edgesClient,
    },
  })
}
