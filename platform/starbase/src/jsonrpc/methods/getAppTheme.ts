import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppThemeSchema } from '../validators/app'

type GetAppThemeParams = z.infer<typeof AppClientIdParamSchema>

export const GetAppThemeOutput = AppThemeSchema.optional()
export type GetAppThemeResult = z.infer<typeof GetAppThemeOutput>

export const getAppTheme = async ({
  input,
  ctx,
}: {
  input: GetAppThemeParams
  ctx: Context
}): Promise<GetAppThemeResult> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.getTheme()
}
