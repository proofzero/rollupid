import { z } from 'zod'
import { Context } from '../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export const UpsertAppContactAddressInput = z.object({
  clientId: z.string(),
  address: AddressURNInput,
})

type UpsertAppContactAddressParams = z.infer<
  typeof UpsertAppContactAddressInput
>

export const upsertAppContactAddress = async ({
  input,
  ctx,
}: {
  input: UpsertAppContactAddressParams
  ctx: Context
}): Promise<void> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const { edges } = await ctx.edges.getEdges.query({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (edges.length > 1) {
    console.warn('More than one address found for app', input.clientId)
  }

  for (let i = 0; i < edges.length; i++) {
    await ctx.edges.removeEdge.mutate({
      tag: EDGE_HAS_REFERENCE_TO,
      src: edges[i].src.baseUrn,
      dst: edges[i].dst.baseUrn,
    })
  }

  await ctx.edges.makeEdge.mutate({
    src: appURN,
    dst: input.address,
    tag: EDGE_HAS_REFERENCE_TO,
  })
}
