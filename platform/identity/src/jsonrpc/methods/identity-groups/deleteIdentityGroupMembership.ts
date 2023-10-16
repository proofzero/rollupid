import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import {
  IdentityGroupURNValidator,
  IdentityURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { InternalServerError } from '@proofzero/errors'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'
import { IdentityURN } from '@proofzero/urns/identity'
import { initIdentityGroupNodeByName } from '../../../nodes'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { groupAdminValidatorByIdentityGroupURN } from '@proofzero/security/identity-group-validators'

export const DeleteIdentityGroupMembershipInputSchema = z.object({
  identityURN: IdentityURNInput,
  identityGroupURN: IdentityGroupURNValidator,
})
type DeleteIdentityGroupMembershipInput = z.infer<
  typeof DeleteIdentityGroupMembershipInputSchema
>

export const deleteIdentityGroupMembership = async ({
  input,
  ctx,
}: {
  input: DeleteIdentityGroupMembershipInput
  ctx: Context
}): Promise<void> => {
  const { identityGroupURN, identityURN } = input

  await groupAdminValidatorByIdentityGroupURN(ctx, identityGroupURN)

  const caller = router.createCaller(ctx)
  const node = initIdentityGroupNodeByName(identityGroupURN, ctx.IdentityGroup)
  if (!node) {
    throw new InternalServerError({
      message: 'Identity group DO not found',
    })
  }

  const { edges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })

  const ownEdge = edges.find((edge) => edge.src.baseUrn === ctx.identityURN)
  if (!ownEdge) {
    throw new InternalServerError({
      message: 'Requesting account is not part of group',
    })
  }

  if (edges.length === 1) {
    throw new InternalServerError({
      message:
        'Cannot delete the last membership of an identity group. You can try to delete the entire group.',
    })
  }

  const targetEdge = edges.find((edge) => edge.src.baseUrn === identityURN)
  if (!targetEdge) {
    throw new InternalServerError({
      message: 'Target account is not part of group',
    })
  }

  await caller.edges.removeEdge({
    src: identityURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: identityGroupURN,
  })

  const orderedMembers = await node.class.getOrderedMembers()
  await node.class.setOrderedMembers(
    orderedMembers.filter((urn) => urn !== identityURN)
  )

  const oldMemberCount = edges.length
  const newMemberCount = edges.length - 1

  const seats = await node.class.getSeats()
  const seatCount =
    IDENTITY_GROUP_OPTIONS.maxFreeMembers + (seats?.quantity || 0)

  const spd = await node.class.getStripePaymentData()

  if (spd?.paymentFailed) {
    if (oldMemberCount > seatCount && newMemberCount <= seatCount) {
      // This might conflict with an actual failed payment
      // How do we know if the payment failed because of the
      // group size or because of a card error?
      await node.class.setPaymentFailed(false)
    }
  }

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'group_member_removed',
      apiKey: ctx.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
      properties: {
        $groups: { group: identityGroupURN },
        removedIdentityURN: identityURN,
      },
    })
  )
}
