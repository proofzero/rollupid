import { z } from 'zod'
import { Context } from '../context'
import * as oauth from '../../OAuth'
import { getApplicationNodeByClientId } from '../../nodes/application'
import * as secret from '../../secret'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { router } from '@proofzero/platform.core'
import { InternalServerError } from '@proofzero/errors'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { EDGE_APPLICATION } from '../../types'

export const RotateClientSecretInput = AppClientIdParamSchema
export const RotateClientSecretOutput = z.object({
  secret: z.string(),
})

export const rotateClientSecret = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof RotateClientSecretInput>
  ctx: Context
}): Promise<z.infer<typeof RotateClientSecretOutput>> => {
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

  //Make secret and hash it
  const clientSecret = oauth.makeClientSecret()
  const hashedSecret = await secret.hash(clientSecret)

  //Store hashed version of secret
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  await appDO.class.rotateClientSecret(hashedSecret)

  //Return non-hashed version of secret
  return {
    secret: clientSecret,
  }
}
