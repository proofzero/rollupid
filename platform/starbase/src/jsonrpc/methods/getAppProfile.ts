import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppUpdateableFieldsSchema,
} from '../validators/app'

export const GetAppProfileInput = AppClientIdParamSchema

export const GetAppProfileOutput = AppUpdateableFieldsSchema

export const getAppProfile = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppProfileInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppProfileOutput>> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appProfile = await appDO.class.getProfile()

  return appProfile
}
