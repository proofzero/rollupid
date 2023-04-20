import { z } from 'zod'
import { Context } from '../context'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AddressURN } from '@proofzero/urns/address'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export const GetAppContactAddressInput = AppClientIdParamSchema
export const GetAppContactAddressOutput = AddressURNInput.optional()

type GetAppContactAddressParams = z.infer<typeof GetAppContactAddressInput>
type GetAppContactAddressResult = z.infer<typeof GetAppContactAddressOutput>

export const getAppContactAddress = async ({
  input,
  ctx,
}: {
  input: GetAppContactAddressParams
  ctx: Context
}): Promise<GetAppContactAddressResult> => {
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

  if (edges.length === 0) {
    return undefined
  }

  return edges[0].dst.baseUrn as AddressURN
}
