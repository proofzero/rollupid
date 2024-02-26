import { z } from 'zod'
import { Hex } from '../validators/wallet'

import { router } from '@proofzero/platform.core'

import type { Context } from '../../context'
import { CryptoAccount, type AccountNode } from '../../nodes'

export const VerifyNonceInput = z.object({
  nonce: z.string(),
  signature: Hex,
  jwt: z.string().optional(),
  forceAccountCreation: z.boolean().optional(),
})

// TODO: move to shared validators?
export const VerifyNonceOutput = z.object({
  existing: z.boolean(),
})

type VerifyNonceParams = z.infer<typeof VerifyNonceInput>
type VerifyNonceResult = z.infer<typeof VerifyNonceOutput>

export const verifyNonceMethod = async ({
  input,
  ctx,
}: {
  input: VerifyNonceParams
  ctx: Context
}): Promise<VerifyNonceResult> => {
  const { nonce, signature, jwt } = input

  const nodeClient = new CryptoAccount(ctx.account as AccountNode)

  await nodeClient.verifyNonce(nonce, signature)

  const caller = router.createCaller(ctx)
  const { existing } = await caller.account.resolveIdentity({
    jwt,
    force: input.forceAccountCreation,
  })

  return {
    existing,
  }
}
