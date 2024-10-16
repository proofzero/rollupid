import { z } from 'zod'
import { toHex } from 'viem'

import { router } from '@proofzero/platform.core'
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

export const CreateIdentityGroupOutputSchema = z.object({
  groupID: z.string(),
})
type CreateIdentityGroupOutput = z.infer<typeof CreateIdentityGroupOutputSchema>

export const createIdentityGroup = async ({
  input,
  ctx,
}: {
  input: CreateIdentityGroupInput
  ctx: Context
}): Promise<CreateIdentityGroupOutput> => {
  const buffer = new Uint8Array(IDENTITY_GROUP_OPTIONS.length)
  const name = toHex(crypto.getRandomValues(buffer))

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

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: '$groupidentify',
      apiKey: ctx.env.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
      properties: {
        $groups: { group: baseGroupURN },
        $group_type: 'group',
        $group_key: baseGroupURN,
        $group_set: {
          name: input.name,
          groupURN: baseGroupURN,
          date_joined: new Date().toISOString(),
        },
      },
    })
  )

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'identity_created_group',
      apiKey: ctx.env.POSTHOG_API_KEY,
      distinctId: ctx.identityURN as IdentityURN,
      properties: {
        $groups: { group: baseGroupURN },
      },
    })
  )

  return {
    groupID: name,
  }
}
