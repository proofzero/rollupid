import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { ServicePlanType } from '@proofzero/types/account'

export const GetAppPlanInputSchema = AppClientIdParamSchema
type GetAppPlanInput = z.infer<typeof GetAppPlanInputSchema>

export const GetAppPlanOutputSchema = z.nativeEnum(ServicePlanType)
type GetAppPlanOutput = z.infer<typeof GetAppPlanOutputSchema>

export const getAppPlan = async ({
  input,
  ctx,
}: {
  input: GetAppPlanInput
  ctx: Context
}): Promise<GetAppPlanOutput> => {
  const { clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appPlan = await appDO.class.getAppPlan()

  return appPlan ?? ServicePlanType.FREE
}
