import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AppClientIdParamSchema } from '../validators/app'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

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

  await groupAdminValidatorByAppURN(ctx, appURN)

  console.log(`rotating API key for ${appURN}`)

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  const result = await appDO.class.rotateApiKey(appURN)

  return {
    apiKey: result,
  }
}
