import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { NotFoundError } from '@proofzero/errors'

export const GetAppDetailsInput = AppClientIdParamSchema

export const GetAppDetailsOutput = AppUpdateableFieldsSchema.merge(
  AppReadableFieldsSchema
)

export const getAppDetails = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppDetailsInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppDetailsOutput>> => {
  const appURN = ApplicationURNSpace.componentizedUrn(input.clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN)) {
    throw new NotFoundError({
      message: `Request received for clientId ${input.clientId} which is not owned by provided account.`
    })
  }
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()

  return appDetails
}
