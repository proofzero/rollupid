import { z } from 'zod'
import { Context } from '../../../context'
import { RollupError } from '@proofzero/errors'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import {
  EmailAddressType,
  OAuthAddressType,
  CryptoAddressType,
} from '@proofzero/types/address'
import { initIdentityGroupNodeByName } from '../../../nodes'

export const GetIdentityGroupMemberInvitationsInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type GetIdentityGroupMemberInvitationsInput = z.infer<
  typeof GetIdentityGroupMemberInvitationsInputSchema
>

export const GroupMemberInvitationSchema = z.object({
  identifier: z.string(),
  addressType: z.union([
    z.nativeEnum(EmailAddressType),
    z.nativeEnum(OAuthAddressType),
    z.nativeEnum(CryptoAddressType),
  ]),
  invitationCode: z.string(),
})

export const GetIdentityGroupMemberInvitationsOutputSchema = z.array(
  GroupMemberInvitationSchema
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

  const node = await initIdentityGroupNodeByName(
    identityGroupURN,
    ctx.IdentityGroup
  )
  if (!node) {
    throw new RollupError({
      message: 'Identity group DO not found',
    })
  }

  const invitations = await node.class.getInvitations()

  return invitations.map((invitation) => ({
    identifier: invitation.identifier,
    addressType: invitation.addressType,
    invitationCode: invitation.inviteCode,
  }))
}
