import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { IdentityURNInput } from '@proofzero/platform-middleware/inputValidators'
import { RollupError, ERROR_CODES } from '@proofzero/errors'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { AccountURN } from '@proofzero/urns/account'

import type { Context } from '../../context'
import { getAccountReferenceTypes } from './getAccountReferenceTypes'

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
  const { identityURN, forceDelete } = input

  const nodeClient = ctx.account

  const caller = router.createCaller(ctx)
  const identityEdge = await caller.edges.findNode({
    baseUrn: identityURN,
  })

  if (!forceDelete) {
    const primaryAccountURN = identityEdge?.qc.primaryAccountURN
    if (primaryAccountURN === ctx.accountURN) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Cannot disconnect primary account',
      })
    }

    const accountUsage = await getAccountReferenceTypes({ ctx })
    if (accountUsage.length > 0) {
      throw new RollupError({
        code: ERROR_CODES.BAD_REQUEST,
        message: `Cannot disconnect active account (${accountUsage.join(
          ', '
        )})`,
      })
    }
  }

  // Get the account associated with the authorization header included in the request.
  const account = ctx.accountURN as AccountURN

  if (!IdentityURNSpace.is(identityURN)) {
    throw new Error('Invalid identity URN')
  }

  // Remove the stored identity in the node.
  await nodeClient?.class.unsetIdentity()

  const { edges: accountEdges } = await caller.edges.getEdges({
    query: {
      dst: {
        baseUrn: account,
      },
    },
  })

  // Remove any edge that references the account node
  const edgeDeletionPromises = accountEdges.map((edge) => {
    return caller.edges.removeEdge({
      src: edge.src.baseUrn,
      dst: edge.dst.baseUrn,
      tag: edge.tag,
    })
  })

  await Promise.all(edgeDeletionPromises)

  await caller.edges.deleteNode({
    urn: account,
  })

  return ctx.account?.storage.deleteAll()
}
