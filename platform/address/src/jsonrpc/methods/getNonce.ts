import { AddressURNInput } from '@kubelt/platform-middleware/inputValidators'
import { z } from 'zod'
import { Context } from '../../context'
import { CryptoAddressProxyStub } from '../../nodes/crypto'

export const GetNonceInput = z.object({
  address: AddressURNInput,
  template: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  state: z.string(),
})

type GetNonceParams = z.infer<typeof GetNonceInput>

export const getNonceMethod = async ({
  input,
  ctx,
}: {
  input: GetNonceParams
  ctx: Context
}): Promise<string> => {
  const { address, template, redirectUri, scope, state } = input

  const nodeClient = ctx.address as CryptoAddressProxyStub
  return await nodeClient.class.getNonce(
    address,
    template,
    redirectUri,
    scope,
    state
  )
}
