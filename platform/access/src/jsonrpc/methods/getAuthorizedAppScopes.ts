import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@proofzero/platform-middleware'
import { AccountURNSpace } from '@proofzero/urns/account'
import { decodeJwt } from 'jose'
import { InternalServerError } from '@proofzero/errors'

export const GetAuthorizedAppScopesMethodInput = z.object({
  accountURN: inputValidators.AccountURNInput,
  clientId: z.string().min(1),
})
type GetAuthorizedAppScopesMethodParams = z.infer<
  typeof GetAuthorizedAppScopesMethodInput
>

export const GetAuthorizedAppScopesMethodOutput = z.array(
  z.object({
    timestamp: z.number(),
    scopes: z.array(z.string()),
  })
)
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

  const { tokenIndex, tokenMap } = await accessNode.class.getTokenState()

  const tokens = tokenIndex.map((t) => tokenMap[t])
  const dtMappedScopes = await Promise.all(
    tokens.map(async (t) => {
      const { iat } = decodeJwt(t.jwt)
      if (!iat) {
        throw new InternalServerError({
          message: 'IAT missing in token',
        })
      }

      const scopes = t.scope

      return {
        scopes,
        timestamp: iat,
      }
    })
  )

  return dtMappedScopes
}
