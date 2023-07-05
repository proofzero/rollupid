import { z } from 'zod'
import { Context } from '../context'
import { ServicePlanType } from '@proofzero/types/account'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { EDGE_PAYS_APP } from '@proofzero/types/graph'
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

export const reconcileAppSubscriptions = async ({
  input,
  ctx,
}: {
  input: ReconcileAppSubscriptionsInput
  ctx: Context
}): Promise<void> => {
  const { accountURN, plan, count } = input

  const { edges } = await ctx.edges.getEdges.query({
    query: {
      src: { baseUrn: accountURN },
      tag: EDGE_PAYS_APP,
    },
  })

  const apps = []
  for (const edge of edges) {
    const clientID = ApplicationURNSpace.decode(edge.dst.baseUrn)
    const appDO = await getApplicationNodeByClientId(clientID, ctx.StarbaseApp)

    const appDetails = await appDO.class.getDetails()
    if (appDetails.createdTimestamp != null) {
      apps.push({
        ...appDetails,
        appURN: edge.dst.baseUrn,
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
      }))

    for (const app of targetApps) {
      await ctx.edges.removeEdge.mutate({
        src: accountURN,
        tag: EDGE_PAYS_APP,
        dst: app.appURN,
      })

      const appDO = await getApplicationNodeByClientId(
        app.clientID,
        ctx.StarbaseApp
      )
      await appDO.class.deleteAppPlan()
    }
  }
}
