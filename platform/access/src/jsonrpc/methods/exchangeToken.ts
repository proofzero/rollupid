import { z } from 'zod'

import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { AccessURNSpace } from '@kubelt/urns/access'
import { AccountURNSpace } from '@kubelt/urns/account'

import { Context } from '../../context'
import { initAuthorizationNodeByName, initAccessNodeByName } from '../../nodes'

import { URN_NODE_TYPE_AUTHORIZATION } from '../../constants'
import { GrantType } from '../../types'
import { tokenValidator } from '../middleware/validators'

export const ExchangeTokenMethodInput = z.discriminatedUnion('grantType', [
  z.object({
    grantType: z.literal(GrantType.AuthenticationCode),
    account: AccountURNInput,
    code: z.string(),
    redirectUri: z.string(),
    clientId: z.string(),
  }),
  z.object({
    grantType: z.literal(GrantType.AuthorizationCode),
    account: AccountURNInput,
    code: z.string(),
    redirectUri: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
  }),
  z.object({
    grantType: z.literal(GrantType.RefreshToken),
    token: tokenValidator,
  }),
])

export const ExchangeTokenMethodOutput = z.object({
  code: z.string(),
  state: z.string(),
})

export type ExchangeTokenParams = z.infer<typeof ExchangeTokenMethodInput>

export const exchangeTokenMethod = async ({
  input,
  ctx,
}: {
  input: ExchangeTokenParams
  ctx: Context
}) => {
  const { grantType } = input

  if (grantType == GrantType.AuthenticationCode) {
    const { account, code, redirectUri, clientId } = input
    const accountId = AccountURNSpace.decode(account)
    const name = AccessURNSpace.fullUrn(accountId, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })

    const authorizationNode = initAuthorizationNodeByName(
      name,
      ctx.Authorization
    )
    const { scope } = await authorizationNode.exchangeToken({
      account,
      code,
      redirectUri,
      clientId,
    })

    // create a new id but use it as the name
    const objectId = ctx.Access.newUniqueId().toString()
    const accessNode = initAccessNodeByName(objectId, ctx.Access)
    const result = await accessNode.generate({
      objectId,
      account,
      clientId,
      scope,
    })

    return result
  } else if (grantType == GrantType.AuthorizationCode) {
    const { account, code, redirectUri, clientId, clientSecret } = input

    const name = AccessURNSpace.fullUrn(account, {
      r: URN_NODE_TYPE_AUTHORIZATION,
      q: { clientId },
    })

    const authorizationNode = initAuthorizationNodeByName(
      name,
      ctx.Authorization
    )
    const { scope } = await authorizationNode.params(code)

    const validated = await ctx.starbaseClient.kb_appAuthCheck({
      redirectURI: redirectUri,
      scopes: scope,
      clientId,
      clientSecret,
    })
    if (validated) {
      const { scope } = await authorizationNode.exchangeCode(
        code,
        redirectUri,
        clientId
      )

      // create a new id but use it as the name
      const objectId = ctx.Access.newUniqueId().toString()
      const accessNode = initAccessNodeByName(objectId, ctx.Access)
      const result = await accessNode.generate(account, clientId, scope)
      return result
    } else {
      throw new Error(`failed authorization attempt`)
    }
  } else if (grantType == GrantType.RefreshToken) {
    const {
      token: { iss, token },
    } = input

    const accessNode = initAccessNodeByName(iss, ctx.Access)
    const result = await accessNode.refresh({
      objectId: iss,
      token,
    })
    return result
  } else {
    throw new Error(`unsupported grant type: ${grantType}`)
  }
}
