import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@kubelt/platform-middleware'
import { AccountURNSpace } from '@kubelt/urns/account'
import { scope, SCOPES } from '@kubelt/security/scopes'

export const GetAuthorizedAppScopesInput = z.object({
  accountURN: inputValidators.AccountURNInput,
  clientId: z.string(),
})
export const GetAuthorizedAppScopesOutput = z.array(
  z.object({
    permission: z.string(),
    scopes: z.array(z.string()),
  })
)

export const getAuthorizedAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAuthorizedAppScopesInput>
  ctx: Context
}): Promise<z.infer<typeof GetAuthorizedAppScopesOutput>> => {
  const name = `${AccountURNSpace.decode(input.accountURN)}@${input.clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const { tokenIndex, tokenMap } = await accessNode.class.getTokenState()

  // Get a map of all the scopes
  // in all authorizations
  const tokens = tokenIndex.map((t) => tokenMap[t])
  const scopes = tokens.flatMap((t) => t.scope)

  // Filter for unique scopes
  const uniqueScopes = Array.from(new Set(scopes))

  // Add implicit openid scope
  uniqueScopes.push('scope://rollup.id/openid')

  // Generate an array of [{
  //   permission: 'read' | 'write' | 'root' | ... based on scope structure,
  //   scope: 'scope'
  // }]
  const castScopes = uniqueScopes
    .filter((s) => Object.getOwnPropertySymbols(SCOPES).includes(scope(s)))
    .map((s) => ({
      name: SCOPES[scope(s)].name,
      permission: s.split('#')[1] ?? 'claims',
    }))

  // Get a list of unique permissions
  const uniquePermissions = Array.from(
    new Set(castScopes.map((cs) => cs.permission))
  )

  // Generate array with
  // permission and list of scopes
  // associated to that permission
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
