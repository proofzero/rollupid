import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import createEdgesClient from '@proofzero/platform-clients/edges'
import { AccountURN } from '@proofzero/urns/account'
import { EDGE_APPLICATION } from '../types'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
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
