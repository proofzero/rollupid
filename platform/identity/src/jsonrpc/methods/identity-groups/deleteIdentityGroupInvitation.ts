import { z } from 'zod'

import { Context } from '../../../context'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { InternalServerError } from '@proofzero/errors'
import { initIdentityGroupNodeByName } from '../../../nodes'
import identityGroupAdminValidator from '@proofzero/security/identity-group-admin-validator'

export const DeleteIdentityGroupInvitationInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  invitationCode: z.string(),
})
type DeleteIdentityGroupInvitationInput = z.infer<
  typeof DeleteIdentityGroupInvitationInputSchema
>

export const deleteIdentityGroupInvitation = async ({
  input,
  ctx,
}: {
  input: DeleteIdentityGroupInvitationInput
  ctx: Context
}): Promise<void> => {
  const { identityGroupURN, invitationCode } = input

  await identityGroupAdminValidator(ctx, identityGroupURN)

  const node = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  if (!node) {
    throw new InternalServerError({
      message: 'Identity group DO not found',
    })
  }

  await node.class.clearInvitation({ inviteCode: invitationCode })
}
