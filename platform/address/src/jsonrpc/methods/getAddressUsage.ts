import { z } from 'zod'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { Context } from '../../context'

export enum AddressUsage {
  Authorization = 'authorization',
  Contact = 'contact',
}

export const GetAddressUsageOutput = z.array(z.nativeEnum(AddressUsage))

type GetAddressUsageResult = z.infer<typeof GetAddressUsageOutput>

export const getAddressUsage = async ({
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

  if (edges.length >= 1) {
    usages.push(AddressUsage.Contact)
  }

  return usages
}
