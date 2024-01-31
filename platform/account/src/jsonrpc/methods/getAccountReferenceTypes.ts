import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { AuthorizationURNSpace } from '@proofzero/urns/authorization'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { ApplicationURNSpace } from '@proofzero/urns/application'

import { ReferenceType } from '../../types'
import type { Context } from '../../context'

export const GetAccountReferenceTypeOutput = z.array(
  z.nativeEnum(ReferenceType)
)

type GetAccountReferenceTypeResult = z.infer<
  typeof GetAccountReferenceTypeOutput
>

export const getAccountReferenceTypes = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetAccountReferenceTypeResult> => {
  const { accountURN } = ctx

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: accountURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  const references: ReferenceType[] = []
  edges.forEach((e) => {
    if (ApplicationURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.DevNotificationsEmail)
    } else if (AuthorizationURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.Authorization)
    } else if (IdentityURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.BillingEmail)
    }
  })

  return references
}
