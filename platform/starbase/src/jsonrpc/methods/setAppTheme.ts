import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

export const SetAppThemeInput = AppClientIdParamSchema.extend({
  theme: AppThemeSchema,
})
type SetAppThemeParams = z.infer<typeof SetAppThemeInput>

export const setAppTheme = async ({
  input,
  ctx,
}: {
  input: SetAppThemeParams
  ctx: Context
}): Promise<void> => {
  const { theme, clientId } = input

  const appURN = ApplicationURNSpace.componentizedUrn(clientId)
  if (!ctx.allAppURNs || !ctx.allAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )

  await groupAdminValidatorByAppURN(ctx, appURN)

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  return appDO.class.setTheme(theme)
}
