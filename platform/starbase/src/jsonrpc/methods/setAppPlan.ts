import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ServicePlanType } from '@proofzero/types/identity'
import { EDGE_PAYS_APP } from '@proofzero/types/graph'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const SetAppPlanInput = AppClientIdParamSchema.extend({
  identityURN: IdentityURNInput,
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
  const { plan, clientId, identityURN } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
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
        src: { baseUrn: identityURN },
        tag: EDGE_PAYS_APP,
        dst: { baseUrn: appURN },
      },
    })

    if (edges.length === 0) {
      await caller.edges.makeEdge({
        src: identityURN,
        tag: EDGE_PAYS_APP,
        dst: appURN,
      })
    }
  } else {
    await caller.edges.removeEdge({
      src: identityURN,
      tag: EDGE_PAYS_APP,
      dst: appURN,
    })
  }

  await createAnalyticsEvent({
    eventName: `app_set_${input.plan}_plan`,
    apiKey: ctx.POSTHOG_API_KEY,
    distinctId: input.identityURN,
    properties: {
      $groups: { app: input.clientId },
      $group_set: {
        plan: input.plan,
      },
    },
  })
}
