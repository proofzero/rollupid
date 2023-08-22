import { z } from 'zod'
import { router } from '@proofzero/platform.core'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'
import { IDENTITY_GROUP_OPTIONS } from '../../../constants'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'

import { Context } from '../../../context'
import type { IdentityURN } from '@proofzero/urns/identity'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const CreateIdentityGroupInputSchema = z.object({
  name: z.string(),
})

type CreateIdentityGroupInput = z.infer<typeof CreateIdentityGroupInputSchema>

export const createIdentityGroup = async ({
  input,
  ctx,
}: {
  input: CreateIdentityGroupInput
  ctx: Context
}): Promise<void> => {
  const name = hexlify(randomBytes(IDENTITY_GROUP_OPTIONS.length))
  const groupURN = IdentityGroupURNSpace.componentizedUrn(name, undefined, {
    name: input.name,
  })
  const baseGroupURN = IdentityGroupURNSpace.getBaseURN(groupURN)

  const caller = router.createCaller(ctx)

  await caller.edges.updateNode({
    urnOfNode: groupURN,
  })

  await caller.edges.makeEdge({
    src: ctx.identityURN as IdentityURN,
    tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
    dst: baseGroupURN,
  })

  await createAnalyticsEvent({
    eventName: '$groupidentify',
    apiKey: ctx.POSTHOG_API_KEY,
    distinctId: ctx.identityURN as IdentityURN,
    properties: {
      $groups: { group: groupURN },
      $group_type: 'group',
      $group_key: groupURN,
      $group_set: {
        name: input.name,
        groupURN: groupURN,
        date_joined: new Date().toISOString(),
      },
    },
  })

  await createAnalyticsEvent({
    eventName: 'identity_created_group',
    apiKey: ctx.POSTHOG_API_KEY,
    distinctId: ctx.identityURN as IdentityURN,
    properties: {
      $groups: { group: groupURN },
    },
  })
}
