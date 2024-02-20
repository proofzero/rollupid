import { router } from '@proofzero/platform.core'

import type { IdentityURN } from '@proofzero/urns/identity'
import type { AccountURN } from '@proofzero/urns/account'
import {
  IdentityURNInput,
  AccountURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { z } from 'zod'

import type { Context } from '../../context'

export const SetIdentityInput = IdentityURNInput
export const SetIdentityOutput = z.object({
  set: z.object({
    identity: IdentityURNInput,
    account: AccountURNInput,
  }),
})

type SetIdentityParams = z.infer<typeof SetIdentityInput>
type SetIdentityResult = z.infer<typeof SetIdentityOutput>

export const setIdentityMethod = async ({
  input,
  ctx,
}: {
  input: SetIdentityParams
  ctx: Context
}): Promise<SetIdentityResult> => {
  const nodeClient = ctx.account
  if (!nodeClient) throw new Error('missing node')

  const account = ctx.accountURN as AccountURN

  const identity = input
  if (!IdentityURNSpace.is(identity)) {
    throw new Error('Invalid identity URN')
  }

  // Store the owning identity for the account node in the node
  // itself.
  await nodeClient.class.setIdentity(identity)

  const caller = router.createCaller(ctx)
  const linkResult = await caller.edges.makeEdge({
    src: identity,
    dst: account,
    tag: EDGE_ACCOUNT,
  })

  const edge = linkResult.edge
  return {
    set: {
      identity: edge.src as IdentityURN,
      account: edge.dst as AccountURN,
    },
  }
}
