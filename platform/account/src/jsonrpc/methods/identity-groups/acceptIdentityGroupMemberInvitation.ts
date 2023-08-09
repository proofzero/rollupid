import { z } from 'zod'
import { IdentityGroupURNValidator } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { InternalServerError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { AccountURN } from '@proofzero/urns/account'

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

  const node = await initIdentityGroupNodeByName(
    identityGroupURN,
    ctx.IdentityGroup
  )
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

  if (!ctx.accountURN) {
    throw new InternalServerError({
      message: 'No accountURN in context',
    })
  }

  const addresses = await caller.account.getOwnAddresses({
    account: ctx.accountURN,
  })
  const targetAddress = addresses.find(
    (address) =>
      address.qc.alias.toLowerCase() === invitation.identifier.toLowerCase() &&
      address.rc.addr_type === invitation.addressType
  )
  if (!targetAddress) {
    throw new InternalServerError({
      message: 'Address not found',
    })
  }

  await node.class.claimInvitation({
    inviteCode: invitationCode,
  })

  await caller.edges.makeEdge({
    src: ctx.accountURN as AccountURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })
}
