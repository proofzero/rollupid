import { z } from 'zod'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { Context } from '../../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AccessURNSpace } from '@proofzero/urns/access'

export enum ReferenceType {
  Authorization = 'authorization',
  Contact = 'contact',
}

export const GetAddressReferenceTypeOutput = z.array(z.nativeEnum(ReferenceType))

type GetAddressReferenceTypeResult = z.infer<typeof GetAddressReferenceTypeOutput>

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

  const usages: ReferenceType[] = []

  const contactEdges = edges.filter((e) =>
    ApplicationURNSpace.is(e.src.baseUrn)
  )
  if (contactEdges.length > 0) {
    usages.push(ReferenceType.Contact)
  }

  const authorizationEdges = edges.filter((e) =>
    AccessURNSpace.is(e.src.baseUrn)
  )
  if (authorizationEdges.length > 0) {
    usages.push(ReferenceType.Authorization)
  }

  return usages
}
