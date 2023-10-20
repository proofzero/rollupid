import { z } from 'zod'
import { Context } from '../../../context'
import { UnauthorizedError } from '@proofzero/errors'
import {
  AccountURNInput,
  IdentityGroupURNValidator,
} from '@proofzero/platform-middleware/inputValidators'
import { router } from '@proofzero/platform.core'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { EDGE_MEMBER_OF_IDENTITY_GROUP } from '@proofzero/types/graph'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

export const ConnectIdentityGroupEmailInputSchema = z.object({
  identityGroupURN: IdentityGroupURNValidator,
  accountURN: AccountURNInput,
})

type ConnectIdentityGroupEmailInput = z.infer<
  typeof ConnectIdentityGroupEmailInputSchema
>

export const ConnectIdentityGroupEmailOutputSchema = z.object({
  existing: z.boolean(),
})

type ConnectIdentityGroupEmailOutput = z.infer<
  typeof ConnectIdentityGroupEmailOutputSchema
>

export const connectIdentityGroupEmail = async ({
  input,
  ctx,
}: {
  input: ConnectIdentityGroupEmailInput
  ctx: Context
}): Promise<ConnectIdentityGroupEmailOutput> => {
  const { identityGroupURN, accountURN } = input

  const caller = router.createCaller(ctx)

  const { edges: membershipEdges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: ctx.identityURN,
      },
      tag: EDGE_MEMBER_OF_IDENTITY_GROUP,
      dst: {
        baseUrn: identityGroupURN,
      },
    },
  })
  if (membershipEdges.length === 0) {
    throw new UnauthorizedError({
      message: 'Caller is not a member of the identity group',
    })
  }

  const { edges } = await caller.edges.getEdges({
    query: {
      src: {
        baseUrn: identityGroupURN,
      },
      tag: EDGE_ACCOUNT,
      dst: {
        baseUrn: accountURN,
      },
    },
  })

  if (edges.length > 0) {
    return {
      existing: true,
    }
  }

  await caller.edges.makeEdge({
    src: identityGroupURN,
    tag: EDGE_ACCOUNT,
    dst: accountURN,
  })

  ctx.waitUntil?.(
    createAnalyticsEvent({
      eventName: 'group_email_connected',
      apiKey: ctx.env.POSTHOG_API_KEY,
      distinctId: identityGroupURN,
      properties: {
        $groups: { group: identityGroupURN },
        connectedAccountURN: accountURN,
      },
    })
  )

  return {
    existing: false,
  }
}
