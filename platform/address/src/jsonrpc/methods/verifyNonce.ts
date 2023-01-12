import { z } from 'zod'
import { Context } from '../../context'
import { CryptoAddressProxyStub } from '../../nodes/crypto'

import getAccessClient from '@kubelt/platform-clients/access'
import { ResponseType } from '@kubelt/platform.access/src/types' // TODO: move to types?

import { appRouter } from '../router'
import { Challenge } from '../../types'

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

  const nodeClient = ctx.address as CryptoAddressProxyStub
  const {
    address: clientId,
    redirectUri,
    scope,
    state,
  }: Challenge = await nodeClient.class.verifyNonce(nonce, signature)

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
