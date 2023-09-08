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
import { ROLLUP_INTERNAL_ACCESS_TOKEN_URN } from '@proofzero/platform.authorization/src/constants'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

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

  if (!ctx.identityURN) throw new Error('No identity URN in context')

  const caller = router.createCaller(ctx)

  const { edges: ownEdges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: ctx.identityURN },
      tag: EDGE_APPLICATION,
    },
  })

  const ownAppURNs: ApplicationURN[] = ownEdges.map(
    (edge) => edge.dst.baseUrn as ApplicationURN
  )

  const { edges: identityGroupEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    },
  })

  const identityGroupURNList = identityGroupEdges.map(
    (edge) => edge.dst.baseUrn
  )

  const groupAppURNList = await Promise.all(
    identityGroupURNList.map(async (igu) => {
      const { edges: appEdges } = await caller.edges.getEdges({
        query: {
          src: {
            baseUrn: igu,
          },
          tag: EDGE_APPLICATION,
        },
      })

      return appEdges.map((edge) => edge.dst.baseUrn as ApplicationURN)
    })
  )

  return next({
    ctx: {
      ...ctx,
      ownAppURNs,
      allAppURNs: ownAppURNs.concat(groupAppURNList.flatMap((gau) => gau)),
    },
  })
}
