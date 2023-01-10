import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'

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
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()

  return appDetails
}
