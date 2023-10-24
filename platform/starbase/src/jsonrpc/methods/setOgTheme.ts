import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, OGThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { groupAdminValidatorByAppURN } from '@proofzero/security/identity-group-validators'

export const SetOgThemeInput = AppClientIdParamSchema.extend({
  theme: OGThemeSchema,
})
type SetOgThemeParams = z.infer<typeof SetOgThemeInput>

export const setOgTheme = async ({
  input,
  ctx,
}: {
  input: SetOgThemeParams
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
    ctx.env.StarbaseApp
  )

  await groupAdminValidatorByAppURN(ctx, appURN)

  return appDO.class.setOgTheme(theme)
}
