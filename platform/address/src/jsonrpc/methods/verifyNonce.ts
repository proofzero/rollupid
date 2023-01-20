import { z } from 'zod'
import { Context } from '../../context'

import getAccessClient from '@kubelt/platform-clients/access'
import { ResponseType } from '@kubelt/platform.access/src/types' // TODO: move to types?

import { appRouter } from '../router'
import { Challenge } from '../../types.ts'
import { AddressNode } from '../../nodes'
import CryptoAddress from '../../nodes/crypto'

export const VerifyNonceInput = z.object({
  nonce: z.string(),
  signature: z.string(),
})

// TODO: move to shared validators?
export const VerifyNonceOutput = z.object({
  code: z.string(),
  state: z.string(),
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
  const { nonce, signature } = input

  const nodeClient = new CryptoAddress(ctx.address as AddressNode)
  const {
    address: clientId,
    redirectUri,
    scope,
    state,
  }: Challenge = await nodeClient.verifyNonce(nonce, signature)

  const caller = appRouter.createCaller(ctx)
  const account = await caller.resolveAccount()
  const responseType = ResponseType.Code

  const accessClient = getAccessClient(ctx.Access)
  return accessClient.authorize.mutate({
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state,
  })
}
