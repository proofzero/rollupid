import { z } from 'zod'

import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURNSpace } from '@kubelt/urns/account'

import { Context } from '../../context'
import { URN_NODE_TYPE_AUTHORIZATION } from '../../constants'
import { initAuthorizationNodeByName } from '../../nodes'

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

  const accountId = AccountURNSpace.decode(account)
  const name = AccessURNSpace.fullUrn(accountId, {
    r: URN_NODE_TYPE_AUTHORIZATION,
    q: { clientId },
  })

  const node = await initAuthorizationNodeByName(name, ctx.Authorization)
  const result = await node.authorize(
    account,
    responseType,
    clientId,
    redirectUri,
    scope,
    state
  )

  return { ...result }
}
