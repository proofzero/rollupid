import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@proofzero/platform-middleware'
import { AccountURNSpace } from '@proofzero/urns/account'

export const GetAuthorizedAppScopesMethodInput = z.object({
  accountURN: inputValidators.AccountURNInput,
  clientId: z.string().min(1),
})
type GetAuthorizedAppScopesMethodParams = z.infer<
  typeof GetAuthorizedAppScopesMethodInput
>

export const GetAuthorizedAppScopesMethodOutput = z.array(z.array(z.string()))
export type GetAuthorizedAppScopesMethodResult = z.infer<
  typeof GetAuthorizedAppScopesMethodOutput
>

export const getAuthorizedAppScopesMethod = async ({
  input,
  ctx,
}: {
  input: GetAuthorizedAppScopesMethodParams
  ctx: Context
}) => {
  const { accountURN, clientId } = input

  const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const scopeDict: { [key: string]: string[] } = {}

  const { tokenIndex, tokenMap } = await accessNode.class.getTokenState()

  const tokens = tokenIndex.map((t) => tokenMap[t])
  tokens.forEach((t) => {
    const scopes = t.scope
    scopes.sort()

    const setKey = scopes.join(' ')
    if (!scopeDict[setKey]) {
      scopeDict[setKey] = scopes
    }
  })

  return Object.keys(scopeDict).map((key) => {
    return scopeDict[key]
  })
}
