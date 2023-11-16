import { z } from 'zod'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { AppFeatures } from '../../../types'
import { Context } from '../../context'
import { AppClientIdParamSchema } from '../../validators/app'
import { getApplicationNodeByClientId } from '../../../nodes/application'

export const EnableFeatureInputSchema = AppClientIdParamSchema.extend({
  feature: z.nativeEnum(AppFeatures),
})
type EnableFeatureInput = z.infer<typeof EnableFeatureInputSchema>

export const enableFeature = async ({
  input,
  ctx,
}: {
  input: EnableFeatureInput
  ctx: Context
}) => {
  const { clientId, feature } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )

  let features = await appDO.class.getFeatures()
  features |= feature

  await appDO.class.setFeatures(features)
}
