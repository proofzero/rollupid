import { z } from 'zod'
import { Context } from '../../context'

import { ResponseType } from '@kubelt/types/access'

import getAccessClient from '@kubelt/platform-clients/access'

import { appRouter } from '../router'
import { Challenge } from '../../types'
import { AddressNode } from '../../nodes'
import CryptoAddress from '../../nodes/crypto'

export const VerifyNonceInput = z.object({
  nonce: z.string(),
  signature: z.string(),
  jwt: z.string().optional(),
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
  const { nonce, signature, jwt } = input

  const nodeClient = new CryptoAddress(ctx.address as AddressNode)
  const {
    address: clientId,
    redirectUri,
    scope,
    state,
  }: Challenge = await nodeClient.verifyNonce(nonce, signature)

  const caller = appRouter.createCaller(ctx)
  const account = await caller.resolveAccount({
    jwt,
  })
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
