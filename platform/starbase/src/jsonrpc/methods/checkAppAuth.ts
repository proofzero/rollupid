import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import * as secret from '../../secret'

export const CheckAppAuthInput = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
})

export const CheckAppAuthOutput = z.object({
  valid: z.boolean(),
})

export const checkAppAuth = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CheckAppAuthInput>
  ctx: Context
}): Promise<z.infer<typeof CheckAppAuthOutput>> => {
  const { clientId, clientSecret } = input

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  const hashedSecret = await secret.hash(clientSecret)
  const secretValidity =
    (appDetails.published || false) &&
    (await appDO.class.validateClientSecret(hashedSecret))

  return {
    valid: secretValidity,
  }
}
