import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@kubelt/platform-middleware'
import { AccountURNSpace } from '@kubelt/urns/account'

export const GetAppScopesInput = z.object({
  account: inputValidators.AccountURNInput,
  clientId: z.string(),
})
export const GetAppScopesOutput = z.array(
  z.object({
    key: z.string(),
    value: z.string(),
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

  const tokens = await accessNode.class.getTokens()
  const tokenKeys = Object.keys(tokens)
  console.log({
    tokens,
  })

  const mappedTokens = tokenKeys.map((tk) => ({
    key: 'read-only',
    value: tokens[tk].jwt,
  }))

  return mappedTokens
}
