import { z } from 'zod'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { Context } from '../../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AccessURNSpace } from '@proofzero/urns/access'

export enum AddressUsage {
  Authorization = 'authorization',
  Contact = 'contact',
}

export const GetAddressUsageOutput = z.array(z.nativeEnum(AddressUsage))

type GetAddressUsageResult = z.infer<typeof GetAddressUsageOutput>

export const getAddressReferenceTypes = async ({
  ctx,
}: {
  ctx: Context
}): Promise<GetAddressUsageResult> => {
  const { addressURN } = ctx

  const { edges } = await ctx.edges.getEdges.query({
    query: {
      dst: { baseUrn: addressURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  const usages: AddressUsage[] = []

  const contactEdges = edges.filter((e) =>
    ApplicationURNSpace.is(e.src.baseUrn)
  )
  if (contactEdges.length > 0) {
    usages.push(AddressUsage.Contact)
  }

  const authorizationEdges = edges.filter((e) =>
    AccessURNSpace.is(e.src.baseUrn)
  )
  if (authorizationEdges.length > 0) {
    usages.push(AddressUsage.Authorization)
  }

  return usages
}
