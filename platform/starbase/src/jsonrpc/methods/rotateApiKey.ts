import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@kubelt/urns/application'
import { AppClientIdParamSchema } from '../validators/app'

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
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

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
