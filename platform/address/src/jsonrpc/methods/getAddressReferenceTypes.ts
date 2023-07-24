import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { AccessURNSpace } from '@proofzero/urns/access'
import { AccountURNSpace } from '@proofzero/urns/account'
import { ApplicationURNSpace } from '@proofzero/urns/application'

import { ReferenceType } from '../../types'
import type { Context } from '../../context'

export const GetAddressReferenceTypeOutput = z.array(
  z.nativeEnum(ReferenceType)
)

type GetAddressReferenceTypeResult = z.infer<
  typeof GetAddressReferenceTypeOutput
>

export const getAddressReferenceTypes = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetAddressReferenceTypeResult> => {
  const { addressURN } = ctx

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      dst: { baseUrn: addressURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  const references: ReferenceType[] = []
  edges.forEach((e) => {
    if (ApplicationURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.DevNotificationsEmail)
    } else if (AccessURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.Authorization)
    } else if (AccountURNSpace.is(e.src.baseUrn)) {
      references.push(ReferenceType.BillingEmail)
    }
  })

  return references
}
