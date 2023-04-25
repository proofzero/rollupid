import { z } from 'zod'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { Context } from '../../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AccessURNSpace } from '@proofzero/urns/access'

export enum ReferenceType {
  Authorization = 'authorization',
  DevNotificationsEmail = 'developerNotificationsEmail',
}

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

  const { edges } = await ctx.edges.getEdges.query({
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
    }
  })

  return references
}
