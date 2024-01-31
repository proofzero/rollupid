import { z } from 'zod'
import { Context } from '../../../context'
import { RollupError } from '@proofzero/errors'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import {
  EmailAccountType,
  OAuthAccountType,
  CryptoAccountType,
} from '@proofzero/types/account'
import { initIdentityGroupNodeByName } from '../../../nodes'

export const GetIdentityGroupMemberInvitationsInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
})
type GetIdentityGroupMemberInvitationsInput = z.infer<
  typeof GetIdentityGroupMemberInvitationsInputSchema
>

export const GroupMemberInvitationSchema = z.object({
  identifier: z.string(),
  accountType: z.union([
    z.nativeEnum(EmailAccountType),
    z.nativeEnum(OAuthAccountType),
    z.nativeEnum(CryptoAccountType),
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
    accountType: invitation.accountType,
    invitationCode: invitation.inviteCode,
  }))
}
