import { z } from 'zod'
import {
  AddressURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../../context'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { RollupError } from '@proofzero/errors'
import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

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

  const caller = router.createCaller(ctx)

  if (!ctx.accountURN) {
    throw new RollupError({
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
    throw new RollupError({
      message: 'Address not found',
    })
  }

  await node.class.claimInvitation({
    inviteCode: invitationCode,
  })

  await caller.edges.makeEdge({
    src: targetAddress.baseUrn,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })
}
