import { z } from 'zod'
import { Context } from '../context'
import * as oauth from '../../OAuth'
import { getApplicationNodeByClientId } from '../../nodes/application'
import * as secret from '../../secret'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

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

  await groupAdminValidatorByAppURN(ctx, appURN)

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
