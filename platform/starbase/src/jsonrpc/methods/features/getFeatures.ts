import { z } from 'zod'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { Context } from '../../context'
import { AppClientIdParamSchema } from '../../validators/app'
import { getApplicationNodeByClientId } from '../../../nodes/application'

export const GetFeaturesInputSchema = AppClientIdParamSchema
type GetFeaturesInput = z.infer<typeof GetFeaturesInputSchema>

export const getFeatures = async ({
  input,
  ctx,
}: {
  input: GetFeaturesInput
  ctx: Context
}) => {
  const { clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )

  return appDO.class.getFeatures()
}
