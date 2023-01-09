import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppReadableFieldsSchema,
  AppUpdateableFieldsSchema,
} from '../../types'

export const getAppProfile = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof AppClientIdParamSchema>
  ctx: Context
}): Promise<z.infer<typeof AppUpdateableFieldsSchema>> => {
  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.Starbase)
  const appProfile = await appDO.class.getProfile()

  return appProfile
}
