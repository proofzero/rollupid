import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import * as oauth from '../../OAuth'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { EDGE_APPLICATION } from '../../types'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { ServicePlanType } from '@proofzero/types/billing'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { InternalServerError } from '@proofzero/errors'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'

export const CreateAppInputSchema = z.object({
  clientName: z.string(),
  identityGroupURN: IdentityGroupURNValidator.optional(),
})

export const CreateAppOutputSchema = z.object({
  clientId: z.string(),
})

export const createApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CreateAppInputSchema>
  ctx: Context
}): Promise<z.infer<typeof CreateAppOutputSchema>> => {
  //TODO(betim) check if app with that name exists for account

  // Create initial OAuth configuration for the application. There
  // is no secret associated with the app after creation. The
  // rotateSecret method must be called to generate the initial
  // OAuth secret and return it to the caller.
  const clientId = oauth.makeClientId()
  const appURN = ApplicationURNSpace.componentizedUrn(clientId, undefined, {
    name: input.clientName,
  })
  if (!ctx.identityURN) throw new Error('No identity URN in context')

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )
  await appDO.class.init(clientId, input.clientName)

  const caller = router.createCaller(ctx)

  if (input.identityGroupURN) {
    await groupAdminValidatorByIdentityGroupURN(ctx, input.identityGroupURN)

    const { edges } = await caller.edges.getEdges({
      query: {
        src: {
          baseUrn: ctx.identityURN,
        },
        tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
        dst: {
          baseUrn: input.identityGroupURN,
        },
      },
    })

    if (edges.length === 0) {
      throw new InternalServerError({
        message: 'Requesting account is not part of group',
      })
    }
  }

  const targetURN = input.identityGroupURN ?? ctx.identityURN

  const edgeRes = await caller.edges.makeEdge({
    src: targetURN,
    dst: appURN,
    tag: EDGE_APPLICATION,
  })

  if (!edgeRes.edge) {
    console.error({ edgeRes })
    throw new Error(`Could not link app ${clientId} to identity ${targetURN}`)
  } else {
    console.log(`Created app ${clientId} for identity ${targetURN}`)
  }

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: '$groupidentify',
      apiKey: ctx.env.POSTHOG_API_KEY,
      distinctId: ctx.identityURN,
      properties: {
        $groups: { app: clientId },
        $group_type: 'app',
        $group_key: clientId,
        $group_set: {
          name: input.clientName,
          plan: ServicePlanType.FREE,
          clientId: clientId,
          date_joined: new Date().toISOString(),
        },
      },
    })
  )

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'identity_created_app',
      apiKey: ctx.env.POSTHOG_API_KEY,
      distinctId: ctx.identityURN,
      properties: {
        $groups: { app: clientId, group: input.identityGroupURN },
      },
    })
  )

  return {
    clientId: clientId,
  }
}
