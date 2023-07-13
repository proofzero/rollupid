import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { Context } from '../context'
import { ServicePlanType } from '@proofzero/types/account'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EDGE_HAS_REFERENCE_TO, EDGE_PAYS_APP } from '@proofzero/types/graph'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { getApplicationNodeByClientId } from '../../nodes/application'

export const ReconcileAppSubscriptionsInputSchema = z.object({
  accountURN: AccountURNInput,
  count: z.number(),
  plan: z.nativeEnum(ServicePlanType),
})
type ReconcileAppSubscriptionsInput = z.infer<
  typeof ReconcileAppSubscriptionsInputSchema
>

export const ReconcileAppsSubscriptionsOutputSchema = z.array(
  z.object({
    appURN: z.string(),
    clientID: z.string(),
    plan: z.nativeEnum(ServicePlanType),
    devEmail: z.string().optional(),
    appName: z.string(),
  })
)
export type ReconcileAppsSubscriptionsOutput = z.infer<
  typeof ReconcileAppsSubscriptionsOutputSchema
>

export const reconcileAppSubscriptions = async ({
  input,
  ctx,
}: {
  input: ReconcileAppSubscriptionsInput
  ctx: Context
}): Promise<ReconcileAppsSubscriptionsOutput> => {
  const { accountURN, plan, count } = input
  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      src: { baseUrn: accountURN },
      tag: EDGE_PAYS_APP,
    },
  })

  const reconciledApps = []
  const apps = []
  for (const edge of edges) {
    const clientID = ApplicationURNSpace.decode(edge.dst.baseUrn)
    const appDO = await getApplicationNodeByClientId(clientID, ctx.StarbaseApp)

    const appDetails = await appDO.class.getDetails()
    if (appDetails.createdTimestamp != null) {
      const { edges: contactEdges } = await caller.edges.getEdges({
        query: {
          src: { baseUrn: edge.dst.baseUrn },
          tag: EDGE_HAS_REFERENCE_TO,
        },
      })

      let devEmail
      if (contactEdges[0]) {
        devEmail = contactEdges[0].dst.qc.alias
      }

      apps.push({
        ...appDetails,
        appURN: edge.dst.baseUrn,
        devEmail,
      })
    }
  }

  const planApps = apps.filter((app) => app.appPlan === plan)
  if (planApps.length > count) {
    const targetApps = planApps
      .sort((a, b) => +b.createdTimestamp! - +a.createdTimestamp!)
      .slice(0, planApps.length - count)
      .map((app) => ({
        appURN: app.appURN,
        clientID: app.clientId,
        devEmail: app.devEmail,
        appName: app.app?.name ?? 'Undefined',
        plan,
      }))

    for (const app of targetApps) {
      await caller.edges.removeEdge({
        src: accountURN,
        tag: EDGE_PAYS_APP,
        dst: app.appURN,
      })

      const appDO = await getApplicationNodeByClientId(
        app.clientID,
        ctx.StarbaseApp
      )
      await appDO.class.deleteAppPlan()

      reconciledApps.push(app)
    }
  }

  return reconciledApps
}
