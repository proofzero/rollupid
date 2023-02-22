import { z } from 'zod'
import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { inputValidators } from '@kubelt/platform-middleware'
import { AccountURNSpace } from '@kubelt/urns/account'

export const GetAuthorizedScopesInput = z.object({
  account: inputValidators.AccountURNInput,
  client_id: z.string(),
})
export const GetAuthorizedScopesOutput = z.array(z.string())

export const getAuthorizedScopesMethod = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAuthorizedScopesInput>
  ctx: Context
}): Promise<z.infer<typeof GetAuthorizedScopesOutput>> => {
  const name = `${AccountURNSpace.decode(input.account)}@${input.client_id}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const res = await accessNode.class.list()

  console.log({
    res,
  })

  return []
}
