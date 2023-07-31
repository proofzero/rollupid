import * as set from 'ts-set-utils'
import { z } from 'zod'

import { router } from '@proofzero/platform.core'
import { inputValidators } from '@proofzero/platform-middleware'

import { Context } from '../../context'
import { AccountURNSpace } from '@proofzero/urns/account'

import type { AccountList } from '../../types'
import { EDGE_ACCOUNT } from '@proofzero/platform.account/src/constants'

// Should this live in @proofzero/platform-middlewares/inputValidators?
export const AccountListInput = z.custom<AccountList>((input) => {
  if (!Array.isArray(input)) {
    throw new Error('account list must be an array')
  }
  input.forEach((account) => {
    if (!AccountURNSpace.is(account)) {
      throw new Error(`invalid account provided: ${account}`)
    }
  })
  return input as AccountList
})

export const HasAccountsInput = z.object({
  identity: inputValidators.IdentityURNInput,
  accounts: AccountListInput,
})
export type HasAccountsInput = z.infer<typeof HasAccountsInput>

export const HasAccountsOutput = z.boolean()
export type HasAccountsOutput = z.infer<typeof HasAccountsOutput>

export const hasAccountsMethod = async ({
  input,
  ctx,
}: {
  input: HasAccountsInput
  ctx: Context
}): Promise<HasAccountsOutput> => {
  if (input.identity !== ctx.identityURN) {
    throw Error('Invalid identity input')
  }
  // Return the list of edges between the identity node and any
  // account nodes. Don't filter the accounts by type, we want them
  // all (the total number is normally going to be small).
  const query = {
    // We are only interested in edges that start at the identity node
    // and terminate at the account node, assuming that identity nodes
    // link to the account nodes that they own.
    src: { baseUrn: input.identity },
    // We only want edges that link to account nodes.
    tag: EDGE_ACCOUNT,

    qc: {
      hidden: input.identity === ctx.identityURN,
    },
  }

  const caller = router.createCaller(ctx)
  const edgesResult = await caller.edges.getEdges({ query })
  const edgeList = edgesResult.edges

  // A set of the accounts owned by the identity.
  const ownedAccounts = new Set(
    edgeList.map((edge) => {
      return edge.dst.baseUrn
    })
  )
  // The input set of accounts to check.
  const inputAccounts = new Set(input.accounts)

  // Determine if set B is a subset of set A. A set B is a subset of A
  // if all elements of B are in set
  return set.subset(ownedAccounts, inputAccounts)
}
