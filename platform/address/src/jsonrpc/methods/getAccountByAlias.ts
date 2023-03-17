import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'
import { Context } from '../../context'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { z } from 'zod'
import { AccountURN } from '@proofzero/urns/account'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

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
  let alias = input.alias
  if (input.provider === 'eth' && input.alias.endsWith('.eth')) {
    alias = (await new ENSUtils().getEnsEntry(input.alias)).address
  }

  const { edges } = await ctx.edges.getEdges.query({
    query: {
      tag: EDGE_ADDRESS,
      dst: {
        rc: { addr_type: input.provider },
        qc: { alias, hidden: false },
      },
    },
  })

  if (edges.length > 1) {
    throw new Error('Cannot resolve unique alias due to data conflict.')
  }

  const account = edges.map((edge) => edge.src.baseUrn)[0]

  return account as AccountURN
}
