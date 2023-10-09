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
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'

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
    await identityGroupAdminValidator(ctx, ownershipURN as IdentityGroupURN)
  }

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  await appDO.class.setAppPlan(plan)

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

  const buildAnalyticsEvent = async () => {
    // This is the way how we can update group properties
    // https://posthog.com/tutorials/frontend-vs-backend-group-analytics
    await createAnalyticsEvent({
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

    await createAnalyticsEvent({
      eventName: `app_set_${plan}_plan`,
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: input.URN,
      properties: {
        $groups: {
          app: clientId,
          group: IdentityGroupURNSpace.is(appOwnershipEdges[0].src.baseUrn)
            ? appOwnershipEdges[0].src.baseUrn
            : undefined,
        },
      },
    })
  }

  ctx.waitUntil?.(buildAnalyticsEvent())
}
