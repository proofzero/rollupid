import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, EmailOTPThemeSchema } from '../validators/app'

type GetEmailOTPThemeParams = z.infer<typeof AppClientIdParamSchema>

export const GetEmailOTPThemeOutput = EmailOTPThemeSchema.optional()
export type GetEmailOTPThemeResult = z.infer<typeof GetEmailOTPThemeOutput>

export const getEmailOTPTheme = async ({
  input,
  ctx,
}: {
  input: GetEmailOTPThemeParams
  ctx: Context
}): Promise<GetEmailOTPThemeResult> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  return appDO.class.getEmailOTPTheme()
}
