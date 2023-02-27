import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@kubelt/platform-middleware'
import { AccountURNSpace } from '@kubelt/urns/account'
import { scope, SCOPES } from '@kubelt/security/scopes'

export const GetAppScopesInput = z.object({
  account: inputValidators.AccountURNInput,
  clientId: z.string(),
})
export const GetAppScopesOutput = z.array(
  z.object({
    permission: z.string(),
    scopes: z.array(z.string()),
  })
)

export const getAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppScopesInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppScopesOutput>> => {
  const name = `${AccountURNSpace.decode(input.account)}@${input.clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const { tokenIndex, tokenMap } =
    await accessNode.class.getParameterlessTokenState()

  const tokens = tokenIndex.map((t) => tokenMap[t])
  const scopes = tokens.flatMap((t) => t.scope)

  const uniqueScopes = scopes.filter((v, i, a) => a.indexOf(v) === i)
  uniqueScopes.push('scope://rollup.id/openid')

  const castScopes = uniqueScopes
    .filter((s) => Object.getOwnPropertySymbols(SCOPES).includes(scope(s)))
    .map((s) => ({
      name: SCOPES[scope(s)].name,
      permission: s.split('#')[1] ?? 'root',
    }))

  const uniquePermissions = castScopes
    .map((cs) => cs.permission)
    .filter((v, i, a) => a.indexOf(v) === i)

  const mappedTokens: {
    permission: string
    scopes: string[]
  }[] = []
  for (let i = 0; i < uniquePermissions.length; i++) {
    const permission = uniquePermissions[i]
    const scopes = castScopes
      .filter((cs) => cs.permission === permission)
      .map((cs) => cs.name)

    mappedTokens.push({
      permission: permission.replace(/\b\w/g, (c) => c.toUpperCase()),
      scopes,
    })
  }

  return mappedTokens
}
