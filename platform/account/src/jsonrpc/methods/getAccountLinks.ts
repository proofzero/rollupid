import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import {
  AuthorizationURN,
  AuthorizationURNSpace,
} from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { ApplicationURNSpace } from '@proofzero/urns/application'

import { ReferenceType } from '../../types'
import type { Context } from '../../context'
import { AnyURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AnyURN } from '@proofzero/urns'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

export const GetAccountLinksOutput = z.array(
  z.object({
    URN: AnyURNInput,
    type: z.nativeEnum(ReferenceType),
    identifier: z.string().optional(),
    title: z.string().optional(),
  })
)

export type GetAccountLinksResult = z.infer<typeof GetAccountLinksOutput>

export const getAccountLinks = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetAccountLinksResult> => {
  const { accountURN } = ctx

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: accountURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  const arts = await Promise.all(
    edges.map(async (edge) => {
      if (ApplicationURNSpace.is(edge.src.baseUrn)) {
        return buildResType(
          ReferenceType.DevNotificationsEmail,
          edge.src.baseUrn,
          edge.src.baseUrn.split('/')[1],
          edge.src.qc.name
        )
      } else if (AuthorizationURNSpace.is(edge.src.baseUrn)) {
        const clientId = (edge.src.baseUrn as AuthorizationURN)
          .split('/')[1]
          .split('@')[1]

        return buildResType(
          ReferenceType.Authorization,
          edge.src.baseUrn,
          clientId
        )
      } else if (IdentityGroupURNSpace.is(edge.src.baseUrn)) {
        return buildResType(
          ReferenceType.BillingEmail,
          edge.src.baseUrn,
          (edge.src.baseUrn as IdentityGroupURN).split('/')[1],
          edge.src.qc.name
        )
      } else if (IdentityURNSpace.is(edge.src.baseUrn)) {
        return buildResType(ReferenceType.BillingEmail, edge.src.baseUrn)
      } else {
        console.warn('Invalid reference type: ', edge.src.baseUrn)
      }

      return undefined
    })
  )

  return arts.filter((art) => !!art) as GetAccountLinksResult
}

const buildResType = (
  type: ReferenceType,
  URN: AnyURN,
  identifier?: string,
  title?: string
): {
  URN: AnyURN
  type: ReferenceType
  identifier?: string
  title?: string
} => ({
  URN,
  type,
  identifier,
  title,
})
