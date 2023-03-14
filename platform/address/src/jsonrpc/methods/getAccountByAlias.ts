import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'
import { Context } from '../../context'
import { EDGE_ADDRESS } from '@kubelt/platform.address/src/constants'
import { z } from 'zod'
import { AccountURN } from '@kubelt/urns/account'

export const GetAccountByAliasInput = z.object({
  provider: z.string(),
  alias: z.string(),
})

export const GetAccountByAliasOutput = AccountURNInput.optional()

type GetAccountByAliasParams = z.infer<typeof GetAccountByAliasInput>
type GetAccountByAliasResult = z.infer<typeof GetAccountByAliasOutput>

export const getAccountByAliasMethod = async ({
  input,
  ctx,
}: {
  input: GetAccountByAliasParams
  ctx: Context
}): Promise<GetAccountByAliasResult> => {
  const { edges } = await ctx.edges.getEdges.query({
    query: {
      tag: EDGE_ADDRESS,
      dst: { rc: { addr_type: input.provider }, qc: { alias: input.alias } },
    },
  })

  if (edges.length > 1) {
    throw new Error('Cannot resolve unique alias due to data conflict.')
  }

  /**
   * When we have proper `hidden`-address functionality
   * we'll need to do it like this:
   * const account = edges
   *              .filter(edge => !edge.dst.qc.hidden)
   *              .map((edge) => edge.src.baseUrn)[0]
   */
  const account = edges.map((edge) => edge.src.baseUrn)[0]

  return account as AccountURN
}
