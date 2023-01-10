import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../../types'

export const GetAppDetailsOutputSchema = AppUpdateableFieldsSchema.merge(
  AppReadableFieldsSchema
)

export const getAppDetails = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof AppClientIdParamSchema>
  ctx: Context
}): Promise<z.infer<typeof GetAppDetailsOutputSchema>> => {
  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.StarbaseApp)
  const appDetails = await appDO.class.getDetails()

  return appDetails
}
