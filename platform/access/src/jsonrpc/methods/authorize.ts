import { z } from 'zod'

import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { CODE_OPTIONS } from '../../constants'
import { initAuthorizationNodeByName } from '../../nodes'
import { hexlify } from '@ethersproject/bytes'
import { randomBytes } from '@ethersproject/random'

export const AuthorizeMethodInput = z.object({
  account: AccountURNInput,
  responseType: z.string(),
  clientId: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()),
  state: z.string(),
})

export const AuthorizeMethodOutput = z.object({
  code: z.string(),
  state: z.string(),
})

export type AuthorizeParams = z.infer<typeof AuthorizeMethodInput>

export const authorizeMethod = async ({
  input,
  ctx,
}: {
  input: AuthorizeParams
  ctx: Context
}) => {
  const { account, responseType, clientId, redirectUri, scope, state } = input

  const code = hexlify(randomBytes(CODE_OPTIONS.length))

  // TODO: validate the scopes are legitmate here or when we ask for it back in exchangeToken

  const node = await initAuthorizationNodeByName(code, ctx.Authorization)
  const result = await node.class.authorize(
    code,
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state
  )

  return { ...result }
}
