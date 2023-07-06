import { z } from 'zod'
import { Context } from '../../../context'
import { RollupError } from '@proofzero/errors'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import IdentityGroup from '../../../nodes/identity-group'
import {
  EmailAddressType,
  OAuthAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'

export const GetIdentityGroupMemberInvitationsInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type GetIdentityGroupMemberInvitationsInput = z.infer<
  typeof GetIdentityGroupMemberInvitationsInputSchema
>

export const GetIdentityGroupMemberInvitationsOutputSchema = z.array(
  z.object({
    identifier: z.string(),
    addressType: z.union([
      z.nativeEnum(EmailAddressType),
      z.nativeEnum(OAuthAddressType),
      z.nativeEnum(CryptoAddressType),
    ]),
  })
)
type GetIdentityGroupMemberInvitationsOutput = z.infer<
  typeof GetIdentityGroupMemberInvitationsOutputSchema
>

export const getIdentityGroupMemberInvitations = async ({
  input,
  ctx,
}: {
  input: GetIdentityGroupMemberInvitationsInput
  ctx: Context
}): Promise<GetIdentityGroupMemberInvitationsOutput> => {
  const { identityGroupURN } = input

  const DOBinding = IdentityGroup.wrap(ctx.IdentityGroup)
  const node = DOBinding.getByName(identityGroupURN)
  if (!node) {
    throw new RollupError({
      message: 'Identity group DO not found',
    })
  }

  const invitations = await node.class.getInvitations()

  return invitations.map((invitation) => ({
    identifier: invitation.identifier,
    addressType: invitation.addressType,
  }))
}
