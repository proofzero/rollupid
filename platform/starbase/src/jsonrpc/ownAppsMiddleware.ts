import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'
import { EDGE_APPLICATION } from '../types'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import { Context } from './context'

import { parseJwt } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'

export const OwnAppsMiddleware: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  if (ctx.apiKey) {
    const parsedJwt = parseJwt(ctx.apiKey)
    const appUrn = parsedJwt.sub as ApplicationURN
    if (!ApplicationURNSpace.is(appUrn))
      throw new BadRequestError({ message: 'No app URN in API key' })

    const ownAppURNs = [appUrn]
    return next({
      ctx: {
        ...ctx,
        ownAppURNs,
      },
    })
  }

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
