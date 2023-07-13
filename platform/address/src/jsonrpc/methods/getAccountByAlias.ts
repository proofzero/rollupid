import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { AccountURN } from '@proofzero/urns/account'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

import { Context } from '../../context'

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

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
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
