import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import * as secret from '../../secret'

export const CheckAppAuthInput = z.object({
  redirectURI: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  scopes: z.array(z.string()).optional(),
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
  const { redirectURI, clientId, clientSecret, scopes } = input

  const appDO = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)
  const appDetails = await appDO.class.getDetails()

  //To remove potential duplicates, we convert to set
  // TODO: implmenet when scopes infra complete
  // const storedScopes = new Set(appDetails.app?.scopes || [])
  // let validScopes = true
  // for (const e in scopes) {
  //   if (!storedScopes. has(e)) {
  //     validScopes = false
  //     break
  //   }
  // }

  const hashedSecret = await secret.hash(clientSecret)
  const secretValidity = await appDO.class.validateClientSecret(hashedSecret)

  console.log({
    clientId,
    clientSecret,
    secretValidity,
    hashedSecret,
    redirectURI,
    appDetails: appDetails.app?.redirectURI,
  })
  // localhost:80/foobar
  // localhost:80/foobar?foo=bar (startsWith should validate this case)
  const result =
    (secretValidity && appDetails.app?.redirectURI?.startsWith(redirectURI)) ||
    false

  return {
    valid: result,
  }
}
