import { z } from 'zod'
import { Context } from '../../context'

import { ResponseType } from '@proofzero/types/access'

import getAccessClient from '@proofzero/platform-clients/access'

import { appRouter } from '../router'
import { Challenge } from '../../types'
import { AddressNode } from '../../nodes'
import CryptoAddress from '../../nodes/crypto'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'

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

  const caller = appRouter.createCaller(ctx)
  const { existing } = await caller.resolveAccount({
    jwt,
    force: input.forceAccountCreation,
  })

  return {
    existing,
  }
}
