import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppThemeSchema } from '../validators/app'

type GetAppThemesParams = z.infer<typeof AppClientIdParamSchema>

export const GetAppThemesOutput = z
  .record(z.string(), AppThemeSchema)
  .optional()
export type GetAppThemesResult = z.infer<typeof GetAppThemesOutput>

export const getAppThemes = async ({
  input,
  ctx,
}: {
  input: GetAppThemesParams
  ctx: Context
}): Promise<GetAppThemesResult> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.getThemes()
}
