import { z } from 'zod'
import { toHex } from 'viem'

import { router } from '@proofzero/platform.core'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { IdentityURN, IdentityURNSpace } from '@proofzero/urns/identity'

import type { Context } from '../../context'
import { IDENTITY_OPTIONS } from '../../constants'

import { createAnalyticsEvent } from '@proofzero/packages/utils/analytics'

import * as jose from 'jose'

export const ResolveIdentityInput = z.object({
  jwt: z.string().optional(),
  force: z.boolean().optional().default(false),
  clientId: z.string().optional(),
})

export const ResolveIdentityOutput = z.object({
  identityURN: IdentityURNInput,
  existing: z.boolean(),
})

type ResolveIdentityParams = z.infer<typeof ResolveIdentityInput>
type ResolveIdentityResult = z.infer<typeof ResolveIdentityOutput>

// NOTE: this method should only be called for new users
export const resolveIdentityMethod = async ({
  input,
  ctx,
}: {
  input: ResolveIdentityParams
  ctx: Context
}): Promise<ResolveIdentityResult> => {
  const nodeClient = ctx.account

  let eventName = 'account_resolved_identity'

  let resultURN = await nodeClient?.class.getIdentity()
  if (input.jwt && resultURN) {
    return {
      identityURN: resultURN,
      existing: true,
    }
  }

  if (!resultURN) {
    let urn: IdentityURN
    if (input.jwt && !input.force) {
      const decodedJwt = jose.decodeJwt(input.jwt)
      urn = decodedJwt.sub as IdentityURN
    } else {
      const buffer = new Uint8Array(IDENTITY_OPTIONS.length)
      const name = toHex(crypto.getRandomValues(buffer))
      urn = IdentityURNSpace.componentizedUrn(name)
      eventName = 'account_created_identity'
    }
    const caller = router.createCaller(ctx)
    await caller.account.setIdentity(urn) // this will lazy create an identity node when identity worker is called

    resultURN = urn
  }

  ctx.waitUntil?.(
    createAnalyticsEvent({
      apiKey: ctx.env.POSTHOG_API_KEY,
      eventName,
      distinctId: resultURN,
      properties: {
        $groups: { app: input.clientId },
      },
    })
  )

  return {
    identityURN: resultURN,
    existing: false,
  }
}
