import { z } from 'zod'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { IdentityURN } from '@proofzero/urns/identity'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const AcceptIdentityGroupMemberInvitationInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  invitationCode: z.string(),
})

type AcceptIdentityGroupMemberInvitationInput = z.infer<
  typeof AcceptIdentityGroupMemberInvitationInputSchema
>

export const acceptIdentityGroupMemberInvitation = async ({
  input,
  ctx,
}: {
  input: AcceptIdentityGroupMemberInvitationInput
  ctx: Context
}): Promise<void> => {
  const { identityGroupURN, invitationCode } = input

  const node = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  if (!node) {
    throw new InternalServerError({
      message: 'Identity group DO not found',
    })
  }

  const invitations = await node.class.getInvitations()
  const invitation = invitations.find(
    (invitation) => invitation.inviteCode === invitationCode
  )
  if (!invitation) {
    throw new InternalServerError({
      message: 'Invitation not found',
    })
  }

  const caller = router.createCaller(ctx)

  const accounts = await caller.identity.getOwnAccounts({
    URN: ctx.identityURN!,
  })
  const targetAccount = accounts.find(
    (account) =>
      account.qc.alias.toLowerCase() === invitation.identifier.toLowerCase() &&
      account.rc.addr_type === invitation.accountType
  )
  if (!targetAccount) {
    throw new InternalServerError({
      message: 'Account not found',
    })
  }

  await node.class.clearInvitation({
    inviteCode: invitationCode,
  })

  await caller.edges.makeEdge({
    src: ctx.identityURN as IdentityURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })

  const orderedMembers = await node.class.getOrderedMembers()
  await node.class.setOrderedMembers([
    ...orderedMembers,
    ctx.identityURN as IdentityURN,
  ])

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'group_invitation_accepted',
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
      properties: {
        $groups: { group: identityGroupURN },
      },
    })
  )
}
