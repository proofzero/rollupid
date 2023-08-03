import { z } from 'zod'
import { Context } from '../../../context'
import { RollupError } from '@proofzero/errors'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { router } from '@proofzero/platform.core'
import { GroupMemberInvitationSchema } from './getIdentityGroupMemberInvitations'

export const GetIdentityGroupMemberInvitationDetailsInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  invitationCode: z.string(),
})
type GetIdentityGroupMemberInvitationDetailsInput = z.infer<
  typeof GetIdentityGroupMemberInvitationDetailsInputSchema
>

export const GetIdentityGroupMemberInvitationDetailsOutputSchema =
  GroupMemberInvitationSchema.extend({
    identityGroupURN: IdentityGroupURNValidator,
    identityGroupName: z.string(),
    inviter: z.string(),
  })

type GetIdentityGroupMemberInvitationDetailsOutput = z.infer<
  typeof GetIdentityGroupMemberInvitationDetailsOutputSchema
>

export const getIdentityGroupMemberInvitationDetails = async ({
  input,
  ctx,
}: {
  input: GetIdentityGroupMemberInvitationDetailsInput
  ctx: Context
}): Promise<GetIdentityGroupMemberInvitationDetailsOutput> => {
  const { identityGroupURN, invitationCode } = input

  const caller = router.createCaller(ctx)
  const identityGroupNode = await caller.edges.findNode({
    baseUrn: identityGroupURN,
  })
  if (!identityGroupNode) {
    throw new RollupError({
      message: 'Identity group node not found',
    })
  }

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
  const invitation = invitations.find(
    (invitation) => invitation.inviteCode === invitationCode
  )
  if (!invitation) {
    throw new RollupError({
      message: 'Invitation not found',
    })
  }

  const identityGroupName = identityGroupNode.qc.name

  return {
    identityGroupURN,
    identityGroupName,
    invitationCode,
    ...invitation,
  }
}
