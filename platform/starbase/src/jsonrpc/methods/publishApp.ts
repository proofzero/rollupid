import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { ApplicationURNSpace } from '@proofzero/urns/application'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import type { IdentityURN } from '@proofzero/urns/identity'
import { EDGE_APPLICATION } from '../../types'
import { InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'

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
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${input.clientId} which is not owned by provided account.`
    )

  const caller = router.createCaller(ctx)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: { dst: { baseUrn: appURN }, tag: EDGE_APPLICATION },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await groupAdminValidatorByIdentityGroupURN(
      ctx,
      ownershipURN as IdentityGroupURN
    )
  }

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

  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: appURN },
      tag: EDGE_HAS_REFERENCE_TO,
    },
  })

  if (input.published && edges.length === 0) {
    throw new Error('Contact address must be set to publish app')
  }

  await appDO.class.publish(input.published)

  const buildAnalyticsEvent = async () => {
    await createAnalyticsEvent({
      distinctId: ctx.identityURN as IdentityURN,
      eventName: input.published
        ? 'identity_published_app'
        : 'identity_unpublished_app',
      apiKey: ctx.POSTHOG_API_KEY,
      properties: {
        $groups: {
          app: input.clientId,
          group: IdentityGroupURNSpace.is(appOwnershipEdges[0].src.baseUrn)
            ? appOwnershipEdges[0].src.baseUrn
            : undefined,
        },
      },
    })
  }

  ctx.waitUntil?.(buildAnalyticsEvent())

  return {
    published: true,
  }
}
