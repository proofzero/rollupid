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

  /**
   * When we have proper `hidden`-address functionality
   * we'll need to do it like this:
   * const account = edges
   *              .filter(edge => !edge.dst.qc.hidden)
   *              .map((edge) => edge.src.baseUrn)[0]
   */

  if (edges.length > 1) {
    throw new Error(
      'In some apps it is possible to change usernames.\
      This means that one multiple accounts may have one username.\
      This is what happened here. In this case we cannot resolve \
      profile by username and this provider.\
      500 Internal server error'
    )
  }

  const account = edges.map((edge) => edge.src.baseUrn)[0]

  return account as AccountURN
}
