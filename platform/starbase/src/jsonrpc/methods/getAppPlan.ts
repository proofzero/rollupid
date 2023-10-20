import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ServicePlanType } from '@proofzero/types/billing'

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

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )
  const appPlan = await appDO.class.getAppPlan()

  return appPlan ?? ServicePlanType.FREE
}
