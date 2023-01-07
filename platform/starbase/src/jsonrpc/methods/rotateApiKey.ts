import { z } from 'zod'
import { Context } from "../context";
import { getApplicationNodeByClientId } from '../../nodes/application/application';
import { ApplicationURNSpace } from '@kubelt/urns/application';
import { AppClientIdParamSchema } from '../../types';

export const RotateApiKeyOutputSchema = z.object({
  apiKey: z.string(),
})

export const rotateApiKey = async({
  input, 
  ctx
}:{
  input: z.infer<typeof AppClientIdParamSchema>,
  ctx: Context
}) : Promise<z.infer<typeof RotateApiKeyOutputSchema>> => {
  
  const appURN = ApplicationURNSpace.urn(input.clientId)
  console.log(`rotating API key for ${appURN}`)

  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.Starbase)
  const result = await appDO.class.rotateApiKey(appURN)

  return {
    apiKey: result
  }
}
