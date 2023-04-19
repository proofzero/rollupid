import { z } from 'zod'
import { Context } from '../context'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AddressURN } from '@proofzero/urns/address'
import { ADDRESS_APP_REF_TO } from './upsertAppContactEmail'

export const GetAppContactEmailInput = AppClientIdParamSchema
export const GetAppContactEmailOutput = AddressURNInput.optional()

type GetAppContactEmailParams = z.infer<typeof GetAppContactEmailInput>
type GetAppContactEmailResult = z.infer<typeof GetAppContactEmailOutput>

export const getAppContactEmail = async ({
  input,
  ctx,
}: {
  input: GetAppContactEmailParams
  ctx: Context
}): Promise<GetAppContactEmailResult> => {
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

  if (edges.length === 0) {
    return undefined
  }

  return edges[0].src.baseUrn as AddressURN
}
