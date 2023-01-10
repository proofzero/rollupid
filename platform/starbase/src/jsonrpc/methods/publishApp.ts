import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'

export const PublishAppInput = z.object({
  clientId: z.string(),
  published: z.boolean(),
})

export const PublishAppOutput = z.object({
  published: z.boolean(),
})

export const publishApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof PublishAppInput>
  ctx: Context
}): Promise<z.infer<typeof PublishAppOutput>> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  if (appDetails.clientName?.length === 0 || false)
    throw new Error('Client name is required to publish the app')

  const hasClientSecret = await appDO.class.hasClientSecret()
  if (!hasClientSecret)
    throw new Error('Client secret must be set to publish app')

  await appDO.class.publish(input.published)

  return {
    published: true,
  }
}
