import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import type { Context } from '../../context'
import { CryptoAddress, type AddressNode } from '../../nodes'

export const VerifyNonceInput = z.object({
  nonce: z.string(),
  signature: z.string(),
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

  const nodeClient = new CryptoAddress(ctx.address as AddressNode)

  await nodeClient.verifyNonce(nonce, signature)

  const caller = router.createCaller(ctx)
  const { existing } = await caller.address.resolveAccount({
    jwt,
    force: input.forceAccountCreation,
  })

  return {
    existing,
  }
}
