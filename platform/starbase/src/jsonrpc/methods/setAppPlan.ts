import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ServicePlanType } from '@proofzero/types/billing'
import { EDGE_PAYS_APP } from '@proofzero/types/graph'
import { IdentityRefURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { EDGE_APPLICATION } from '../../types'
import { InternalServerError } from '@proofzero/errors'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'

export const SetAppPlanInput = AppClientIdParamSchema.extend({
  URN: IdentityRefURNValidator,
  plan: z.nativeEnum(ServicePlanType),
})
type SetAppPlanParams = z.infer<typeof SetAppPlanInput>

export const setAppPlan = async ({
  input,
  ctx,
}: {
  input: SetAppPlanParams
  ctx: Context
}): Promise<void> => {
  const { plan, clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided identity.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  await appDO.class.setAppPlan(plan)

  const caller = router.createCaller(ctx)

  if (plan && plan !== ServicePlanType.FREE) {
    const { edges } = await caller.edges.getEdges({
      query: {
        src: { baseUrn: input.URN },
        tag: EDGE_PAYS_APP,
        dst: { baseUrn: appURN },
      },
    })

    if (edges.length === 0) {
      await caller.edges.makeEdge({
        src: input.URN,
        tag: EDGE_PAYS_APP,
        dst: appURN,
      })
    }
  } else {
    await caller.edges.removeEdge({
      src: input.URN,
      tag: EDGE_PAYS_APP,
      dst: appURN,
    })
  }

  // This is the way how we can update group properties
  // https://posthog.com/tutorials/frontend-vs-backend-group-analytics
  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: '$groupidentify',
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: input.URN,
      properties: {
        $group_type: 'app',
        $group_key: clientId,
        $group_set: {
          plan,
        },
      },
    })
  )

  const buildAnalyticsEvent = async () => {
    const { edges: ownershipEdges } = await caller.edges.getEdges({
      query: {
        tag: EDGE_APPLICATION,
        dst: { baseUrn: appURN },
      },
    })
    if (ownershipEdges.length === 0) {
      throw new InternalServerError({
        message: 'App ownership edge not found',
      })
    }

    createAnalyticsEvent({
      eventName: `app_set_${plan}_plan`,
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: input.URN,
      properties: {
        $groups: {
          app: clientId,
          group: IdentityGroupURNSpace.is(ownershipEdges[0].src.baseUrn)
            ? ownershipEdges[0].src.baseUrn
            : undefined,
        },
      },
    })
  }

  ctx.waitUntil?.(buildAnalyticsEvent())
}
