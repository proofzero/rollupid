import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { RollupError, ERROR_CODES } from '@proofzero/errors'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { AccountURN } from '@proofzero/urns/account'

import { initIdentityNodeByName } from '@proofzero/platform.identity/src/nodes'
import { GetEdgesMethodOutput } from '@proofzero/platform.edges/src/jsonrpc/methods/getEdges'

import type { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'

import { getAccountLinks } from './getAccountLinks'

export const DeleteAccountNodeInput = z.object({
  identityURN: IdentityURNInput,
  forceDelete: z.boolean().optional(),
})

type DeleteAccountNodeParams = z.infer<typeof DeleteAccountNodeInput>

export const deleteAccountNodeMethod = async ({
  input,
  ctx,
}: {
  input: DeleteAccountNodeParams
  ctx: Context
}) => {
  const { forceDelete } = input

  if (!IdentityURNSpace.is(input.identityURN))
    throw new Error('Invalid identity URN')
  if (!ctx.accountURN) throw new Error('missing account URN')
  if (!ctx.account) throw new Error('missing account node')

  const identityNode = initIdentityNodeByName(
    input.identityURN,
    ctx.env.Identity
  )
  const forwardIdentityURN = await identityNode.class.getForwardIdentityURN()
  const identityURN = forwardIdentityURN || input.identityURN

  const caller = router.createCaller(ctx)

  if (!forceDelete) {
    const identityEdge = await caller.edges.findNode({
      baseUrn: identityURN,
    })

    const primaryAccountURN = identityEdge?.qc.primaryAccountURN
    if (primaryAccountURN === ctx.accountURN) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Cannot disconnect primary account',
      })
    }

    const accountUsage = await getAccountLinks({ ctx })
    if (accountUsage.length > 0) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: `Cannot disconnect active account (${accountUsage.join(
          ', '
        )})`,
      })
    }
  }

  const maskAccountNodes = await caller.edges.findNodeBatch([
    { qc: { source: ctx.accountURN } },
  ])

  const maskAccountURNs = maskAccountNodes.reduce<AccountURN[]>((acc, cur) => {
    cur && acc.push(cur.baseUrn as AccountURN)
    return acc
  }, [])

  let edges: GetEdgesMethodOutput['edges'] = []
  for (const baseUrn of [ctx.accountURN, ...maskAccountURNs]) {
    const query = { dst: { baseUrn } }
    const result = await caller.edges.getEdges({ query })
    edges = edges.concat(result.edges)
  }

  await Promise.all(
    edges.map((edge) => {
      return caller.edges.removeEdge({
        src: edge.src.baseUrn,
        dst: edge.dst.baseUrn,
        tag: edge.tag,
      })
    })
  )

  await Promise.all(
    [ctx.accountURN, ...maskAccountURNs].map((urn) =>
      caller.edges.deleteNode({ urn })
    )
  )

  const maskAccounts = maskAccountURNs.map((urn) =>
    initAccountNodeByName(urn, ctx.env.Account)
  )

  await Promise.all(
    [ctx.account, ...maskAccounts].map((node) => node.storage.deleteAll())
  )
}
