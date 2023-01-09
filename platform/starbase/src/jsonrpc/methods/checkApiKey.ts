import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application'
import { decodeJwt } from 'jose'

export const CheckApiKeyInputSchema = z.object({
  apiKey: z.string(),
})

export const CheckApiKeyOutputSchema = z.object({
  valid: z.boolean(),
})

export const checkApiKey = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CheckApiKeyInputSchema>
  ctx: Context
}): Promise<z.infer<typeof CheckApiKeyOutputSchema>> => {
  const jwtSub = decodeJwt(input.apiKey).sub as ApplicationURN
  const clientId = ApplicationURNSpace.parse(jwtSub).decoded

  const appDO = await getApplicationNodeByClientId(clientId, ctx.Starbase)
  const result = await appDO.class.checkApiKey(input.apiKey)

  return {
    valid: result,
  }
}
