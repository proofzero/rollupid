import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, EmailOTPThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'

export const SetEmailOTPThemeInput = AppClientIdParamSchema.extend({
  theme: EmailOTPThemeSchema,
})
type SetEmailOTPThemeParams = z.infer<typeof SetEmailOTPThemeInput>

export const setEmailOTPTheme = async ({
  input,
  ctx,
}: {
  input: SetEmailOTPThemeParams
  ctx: Context
}): Promise<void> => {
  const { theme, clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.setEmailOTPTheme(theme)
}
