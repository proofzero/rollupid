import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@kubelt/urns/application'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { EDGE_APPLICATION } from '@kubelt/graph/edges'
import { AppClientIdParamSchema } from '../../types'

export const PublishAppInputSchema = z.object({
  clientId: z.string(),
  published: z.boolean(),
})

export const PublishAppOutputSchema = z.object({
  published: z.boolean(),
})

export const publishApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof PublishAppInputSchema>
  ctx: Context
}): Promise<z.infer<typeof PublishAppOutputSchema>> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  if (appDetails.clientName?.length > 0 || false)
    throw new Error('Client name is required to publish the app')

  const hasClientSecret = await appDO.class.hasClientSecret()
  if (!hasClientSecret)
    throw new Error('Client secret must be set to publish app')

  await appDO.class.publish()

  return {
    published: true,
  }
}
