import { z } from 'zod'
import { Context } from '../context'
import * as oauth from '../../0xAuth'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../../types'
import * as secret from '../../secret'

export const RotateClientSecretOutputSchema = z.object({
  secret: z.string(),
})

export const rotateClientSecret = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof AppClientIdParamSchema>
  ctx: Context
}): Promise<z.infer<typeof RotateClientSecretOutputSchema>> => {
  //Make secret and hash it
  const clientSecret = oauth.makeClientSecret()
  const hashedSecret = await secret.hash(clientSecret)

  //Store hashed version of secret
  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.StarbaseApp)
  await appDO.class.rotateClientSecret(hashedSecret)

  //Return non-hashed version of secret
  return {
    secret: clientSecret,
  }
}
