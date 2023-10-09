import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, EmailOTPThemeSchema } from '../validators/app'
import { ApplicationURNSpace } from '@proofzero/urns/application'
import { router } from '@proofzero/platform.core'
import { EDGE_APPLICATION } from '../../types'
import { InternalServerError } from '@proofzero/errors'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'

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
  return appDO.class.setEmailOTPTheme(theme)
}
