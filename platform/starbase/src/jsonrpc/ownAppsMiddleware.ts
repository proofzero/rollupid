import { BaseMiddlewareFunction } from '@proofzero/platform-middleware/types'

import { router } from '@proofzero/platform.core'

import { EDGE_APPLICATION } from '../types'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import type { Context } from './context'

import { parseJwt } from '@proofzero/utils'
import { BadRequestError } from '@proofzero/errors'
import { ROLLUP_INTERNAL_ACCESS_TOKEN_URN } from '@proofzero/platform.access/src/constants'

export const OwnAppsMiddleware: BaseMiddlewareFunction<Context> = async ({
  ctx,
  next,
}) => {
  if (ctx.token) {
    const parsedToken = parseJwt(ctx.token)
    if (parsedToken.sub === ROLLUP_INTERNAL_ACCESS_TOKEN_URN) {
      const clientId = parsedToken.aud?.[0] as string
      const appUrn = ApplicationURNSpace.urn(clientId)
      const ownAppURNs = [appUrn]
      return next({
        ctx: {
          ...ctx,
          ownAppURNs,
        },
      })
    }
  }

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

  const caller = router.createCaller(ctx)

  //Get application edges for the given accountURN
  const edgeList = await caller.edges.getEdges({
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
