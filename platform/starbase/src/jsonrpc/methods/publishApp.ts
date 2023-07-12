import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { posthogCall } from '@proofzero/utils/posthog'

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
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  if (appDetails.clientName?.length === 0 || false)
    throw new Error('Client name is required to publish the app')

  const hasClientSecret = await appDO.class.hasClientSecret()
  if (!hasClientSecret)
    throw new Error('Client Secret must be set to publish app')

  const { edges } = await ctx.edges.getEdges.query({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (input.published && edges.length === 0) {
    throw new Error('Contact address must be set to publish app')
  }

  await appDO.class.publish(input.published)

  let eventName = ''

  if (input.published) {
    eventName = 'app_published'
  } else if (appDetails.published) {
    /**
     * We can unpublish an app only if it was published before.
     */
    eventName = 'app_unpublished'
  }

  await posthogCall({
    distinctId: ctx.accountURN as string,
    eventName,
    apiKey: ctx.SECRET_POSTHOG_API_KEY,
    properties: { client_id: input.clientId },
  })

  return {
    published: true,
  }
}
