import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AppClientIdParamSchema } from '../validators/app'
import { router } from '@proofzero/platform.core'
import { InternalServerError } from '@proofzero/errors'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { EDGE_APPLICATION } from '../../types'

export const RotateApiKeyInput = AppClientIdParamSchema

export const RotateApiKeyOutput = z.object({
  apiKey: z.string(),
})

export const rotateApiKey = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof RotateApiKeyInput>
  ctx: Context
}): Promise<z.infer<typeof RotateApiKeyOutput>> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const caller = router.createCaller(ctx)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: { dst: { baseUrn: appURN }, tag: EDGE_APPLICATION },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await identityGroupAdminValidator(ctx, ownershipURN as IdentityGroupURN)
  }

  console.log(`rotating API key for ${appURN}`)

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const result = await appDO.class.rotateApiKey(appURN)

  return {
    apiKey: result,
  }
}
