import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { AccountURN } from '@kubelt/urns/account'
import { EdgeDirection } from '@kubelt/types/graph'
import { EDGE_APPLICATION } from '../types'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'

export const OwnAppsMiddleware: BaseMiddlewareFunction<{
  accountURN?: AccountURN
  Edges: Fetcher
}> = async ({ ctx, next }) => {
  if (!ctx.accountURN) throw new Error('No account URN in context')

  //Get application edges for the given accountURN
  const edgesClient = createEdgesClient(ctx.Edges)
  const edgeList = await edgesClient.getEdges.query({
    query: {
      id: ctx.accountURN,
      dir: EdgeDirection.Outgoing,
      tag: EDGE_APPLICATION,
    },
  })

  const ownAppURNs = []
  for (const edge of edgeList && edgeList.edges) {
    const appURN = ApplicationURNSpace.getBaseURN(edge.dst.id as ApplicationURN)
    ownAppURNs.push(appURN)
  }

  return next({
    ctx: {
      ...ctx,
      ownAppURNs,
    },
  })
}
