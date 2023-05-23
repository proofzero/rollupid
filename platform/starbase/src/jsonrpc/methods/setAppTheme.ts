import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'

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
  if (!ctx.ownAppURNs || !ctx.ownAppURNs.includes(appURN))
    throw new Error(
      `Request received for clientId ${clientId} which is not owned by provided account.`
    )
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.setTheme(theme)
}
