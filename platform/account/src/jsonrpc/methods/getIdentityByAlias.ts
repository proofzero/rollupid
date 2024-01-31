import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'
import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'

import { IdentityURN } from '@proofzero/urns/identity'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

import { Context } from '../../context'

export const GetIdentityByAliasInput = z.object({
  provider: z.string(),
  alias: z.string(),
})

export const GetIdentityByAliasOutput = IdentityURNInput.optional()

type GetIdentityByAliasParams = z.infer<typeof GetIdentityByAliasInput>
type GetIdentityByAliasResult = z.infer<typeof GetIdentityByAliasOutput>

export const getIdentityByAliasMethod = async ({
  input,
  ctx,
}: {
  input: GetIdentityByAliasParams
  ctx: Context
}): Promise<GetIdentityByAliasResult> => {
  let alias = input.alias
  if (input.provider === 'eth' && input.alias.endsWith('.eth')) {
    alias = (await new ENSUtils().getEnsEntry(input.alias)).address
  }

  const caller = router.createCaller(ctx)
  const { edges } = await caller.edges.getEdges({
    query: {
      tag: EDGE_ACCOUNT,
      dst: {
        rc: { addr_type: input.provider },
        qc: { alias, hidden: false },
      },
    },
  })

  if (edges.length > 1) {
    throw new Error('Cannot resolve unique alias due to data conflict.')
  }

  const identity = edges.map((edge) => edge.src.baseUrn)[0]

  return identity as IdentityURN
}
