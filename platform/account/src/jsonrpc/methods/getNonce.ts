import { z } from 'zod'
import { Context } from '../../context'
import { AccountNode } from '../../nodes'
import CryptoAccount from '../../nodes/crypto'

export const GetNonceInput = z.object({
  address: z.string(),
  template: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  state: z.string(),
})

export const GetNonceOutput = z.string()

type GetNonceParams = z.infer<typeof GetNonceInput>

export const getNonceMethod = async ({
  input,
  ctx,
}: {
  input: GetNonceParams
  ctx: Context
}): Promise<string> => {
  const { address, template, redirectUri, scope, state } = input
  const nodeClient = new CryptoAccount(ctx.account as AccountNode)
  return nodeClient.getNonce(address, template, redirectUri, scope, state)
}
