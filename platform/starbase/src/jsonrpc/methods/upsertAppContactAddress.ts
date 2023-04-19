import { z } from 'zod'
import { Context } from '../context'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { EdgeSpace, EdgeURN } from '@proofzero/urns/edge'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

export const ADDRESS_APP_REF_TO: EdgeURN = EdgeSpace.urn('refTo/app')

export const UpsertAppContactAddressInput = z.object({
  clientId: z.string(),
  address: AddressURNInput,
})

type UpsertAppContactAddressParams = z.infer<typeof UpsertAppContactAddressInput>

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
      dst: { baseUrn: appURN },
      tag: ADDRESS_APP_REF_TO,
    },
  })

  if (edges.length > 1) {
    console.warn('More than one address found for app', input.clientId)
  }

  for (let i = 0; i < edges.length; i++) {
    await ctx.edges.removeEdge.mutate({
      tag: ADDRESS_APP_REF_TO,
      src: edges[i].src.baseUrn,
      dst: edges[i].dst.baseUrn,
    })
  }

  await ctx.edges.makeEdge.mutate({
    src: input.address,
    dst: appURN,
    tag: ADDRESS_APP_REF_TO,
  })
}
