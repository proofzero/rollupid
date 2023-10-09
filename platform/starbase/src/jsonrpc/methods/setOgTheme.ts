import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, OGThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { router } from '@proofzero/platform.core'
import { EDGE_APPLICATION } from '../../types'
import { InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'

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
    ctx.StarbaseApp
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

  return appDO.class.setOgTheme(theme)
}
