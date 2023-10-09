import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { router } from '@proofzero/platform.core'
import { InternalServerError } from '@proofzero/errors'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { EDGE_APPLICATION } from '../../types'

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

  const caller = router.createCaller(ctx)
  const { edges: appOwnershipEdges } = await caller.edges.getEdges({
    query: { dst: { baseUrn: appURN }, tag: EDGE_APPLICATION },
  })
  if (appOwnershipEdges.length === 0) {
    throw new InternalServerError({
      message: 'App ownership edge not found',
    })
  }

  const ownershipURN = appOwnershipEdges[0].src.baseUrn
  if (IdentityGroupURNSpace.is(ownershipURN)) {
    await identityGroupAdminValidator(ctx, ownershipURN as IdentityGroupURN)
  }

  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  return appDO.class.setTheme(theme)
}
