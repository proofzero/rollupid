import { z } from 'zod'
import { decodeJwt } from 'jose'

import type { AccessJWTPayload } from '@kubelt/types/access'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'

import { EDGE_AUTHORIZES } from '../../constants'

export const RevokeAuthorizationsMethodInput = z.object({
  accountURN: AccountURNInput,
  clientId: z.string(),
  clientSecret: z.string(),
})

type RevokeAuthorizationsMethodInput = z.infer<
  typeof RevokeAuthorizationsMethodInput
>

export const RevokeAuthorizationsMethodOutput = z.void()
type RevokeAuthorizationsMethodOutput = z.infer<
  typeof RevokeAuthorizationsMethodOutput
>

type RevokeAuthorizationsParams = {
  ctx: Context
  input: RevokeAuthorizationsMethodInput
}

interface RevokeAuthorizationsMethod {
  (
    params: RevokeAuthorizationsParams
  ): Promise<RevokeAuthorizationsMethodOutput>
}

export const revokeAuthorizationsMethod: RevokeAuthorizationsMethod = async ({
  ctx,
  input,
}) => {
  const { accountURN, clientId, clientSecret } = input

  if (!ctx.starbaseClient) {
    throw new Error('missing starbase client')
  }

  const { valid } = await ctx.starbaseClient.checkAppAuth.query({
    clientId,
    clientSecret,
  })

  if (!valid) {
    throw new Error('invalid client credentials')
  }

  const name = `${accountURN}@${clientId}`
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  const edgesResult = await ctx.edgesClient?.getEdges.query({
    query: {
      // We only want edges that start at the provided account node.
      src: { baseUrn: accountURN },
      // We only want edges that link to Access nodes (sessions).
      tag: EDGE_AUTHORIZES,
      // Account -> Access edges indicate session ownership.
    },
  })

  if (!edgesResult) {
    throw new Error('invalid edge result')
  }

  // How do we transact this?
  for (let i = 0; i < edgesResult.edges.length; i++) {
    ctx.edgesClient?.removeEdge.mutate({
      tag: EDGE_AUTHORIZES,
      src: edgesResult.edges[i].src.baseUrn,
      dst: edgesResult.edges[i].dst.baseUrn,
    })
  }

  await accessNode.class.revokeAll()
}
