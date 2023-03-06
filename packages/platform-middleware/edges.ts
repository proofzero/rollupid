import { BaseMiddlewareFunction } from './types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { BaseContext } from '@kubelt/types'
import { generateTraceContextHeaders } from './trace'

export const InjectEdges: BaseMiddlewareFunction<
  {
    Edges?: Fetcher
  } & BaseContext
> = ({ ctx, next }) => {
  if (!ctx.Edges) throw new Error('No EDGES binding found in context')
  if (!ctx.traceSpan) throw new Error('No trace span found in context')
  const edgesClient = createEdgesClient(ctx.Edges, {
    ...generateTraceContextHeaders(ctx.traceSpan),
  })

  return next({
    ctx: {
      ...ctx,
      edgesClient,
    },
  })
}
