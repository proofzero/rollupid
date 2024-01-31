import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { AccountURN } from '@proofzero/urns/account'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { Context } from '../context'
import { AppClientIdParamSchema } from '../validators/app'

export const GetAppContactAddressInput = AppClientIdParamSchema
export const GetAppContactAddressOutput = AccountURNInput.optional()

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

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (edges.length > 1) {
    console.warn('More than one account found for app', input.clientId)
  }

  if (edges.length === 0) {
    return undefined
  }

  return edges[0].dst.baseUrn as AccountURN
}
