import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ServicePlanType } from '@proofzero/types/account'
import { EDGE_PAYS_APP } from '@proofzero/types/graph'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

export const SetAppPlanInput = AppClientIdParamSchema.extend({
  accountURN: AccountURNInput,
  plan: z.nativeEnum(ServicePlanType).optional(),
})
type SetAppPlanParams = z.infer<typeof SetAppPlanInput>

export const setAppPlan = async ({
  input,
  ctx,
}: {
  input: SetAppPlanParams
  ctx: Context
}): Promise<void> => {
  const { plan, clientId, accountURN } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  await appDO.class.setAppPlan(plan)

  if (plan && plan !== ServicePlanType.FREE) {
    const { edges } = await ctx.edges.getEdges.query({
      query: {
        src: { baseUrn: accountURN },
        tag: EDGE_PAYS_APP,
        dst: { baseUrn: appURN },
      },
    })

    if (edges.length === 0) {
      await ctx.edges.makeEdge.mutate({
        src: accountURN,
        tag: EDGE_PAYS_APP,
        dst: appURN,
      })
    }
  } else {
    await ctx.edges.removeEdge.mutate({
      src: accountURN,
      tag: EDGE_PAYS_APP,
      dst: appURN,
    })
  }
}
