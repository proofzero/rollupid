import { BaseMiddlewareFunction } from '@kubelt/platform-middleware/types'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { AccountURN } from '@kubelt/urns/account'
import { EDGE_APPLICATION } from '../types'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'
import { Context } from './context'

export const OwnAppsMiddleware: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  if (!ctx.accountURN) throw new Error('No account URN in context')

  //Get application edges for the given accountURN
  const edgeList = await ctx.edges.getEdges.query({
    query: {
      src: { baseUrn: ctx.accountURN },
      tag: EDGE_APPLICATION,
    },
  })

  const ownAppURNs = []
  for (const edge of edgeList && edgeList.edges) {
    const appURN = ApplicationURNSpace.getBaseURN(
      edge.dst.baseUrn as ApplicationURN
    )
    ownAppURNs.push(appURN)
  }

  return next({
    ctx: {
      ...ctx,
      ownAppURNs,
    },
  })
}
