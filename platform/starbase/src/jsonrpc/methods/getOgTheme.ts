import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { OGThemeSchema, AppClientIdParamSchema } from '../validators/app'

type GetOgThemeParams = z.infer<typeof AppClientIdParamSchema>

export const GetOgThemeOutput = OGThemeSchema.optional()
export type GetOgThemeResult = z.infer<typeof GetOgThemeOutput>

export const getOgTheme = async ({
  input,
  ctx,
}: {
  input: GetOgThemeParams
  ctx: Context
}): Promise<GetOgThemeResult> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.getOgTheme()
}
