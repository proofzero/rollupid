import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  ApplicationURN,
  ApplicationURNSpace,
} from '@proofzero/urns/application'
import { decodeJwt } from 'jose'

export const CheckApiKeyInput = z.object({
  apiKey: z.string(),
})

export const CheckApiKeyOutput = z.object({
  valid: z.boolean(),
})

export const checkApiKey = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CheckApiKeyInput>
  ctx: Context
}): Promise<z.infer<typeof CheckApiKeyOutput>> => {
  const jwtSub = decodeJwt(input.apiKey).sub as ApplicationURN
  const clientId = ApplicationURNSpace.parse(jwtSub).decoded

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )

  try {
    await appDO.class.verify(input.apiKey)
    return { valid: await appDO.class.validateApiKey(input.apiKey) }
  } catch (e) {
    return { valid: false }
  }
}
