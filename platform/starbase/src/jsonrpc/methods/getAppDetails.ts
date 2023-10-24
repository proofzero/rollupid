import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { router } from '@proofzero/platform.core'
import { EDGE_APPLICATION } from '../../types'
import { IdentityRefURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'

export const GetAppDetailsInput = AppClientIdParamSchema

export const GetAppDetailsOutput = AppUpdateableFieldsSchema.merge(
  AppReadableFieldsSchema
).merge(
  z.object({
    ownerURN: IdentityRefURNValidator,
  })
)

export const getAppDetails = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppDetailsInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppDetailsOutput>> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()

  const caller = router.createCaller(ctx)
  const ownerEdgeRes = await caller.edges.getEdges({
    query: {
      dst: {
        baseUrn: appURN,
      },
      tag: EDGE_APPLICATION,
    },
  })
  if (ownerEdgeRes.edges.length > 1) {
    console.warn(`Found more than one owner for app ${appURN}`)
  }

  const ownerURN = ownerEdgeRes.edges[0].src.baseUrn as IdentityRefURN

  return {
    ...appDetails,
    ownerURN,
  }
}
