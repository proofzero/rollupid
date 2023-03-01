import { z } from 'zod'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'

import { EDGE_AUTHORIZES } from '../../constants'
import { AccountURNSpace } from '@kubelt/urns/account'

export const RevokeAppAuthorizationsMethodInput = z.object({
  accountURN: AccountURNInput,
  clientId: z.string(),
})

type RevokeAppAuthorizationsMethodInput = z.infer<
  typeof RevokeAppAuthorizationsMethodInput
>

export const RevokeAppAuthorizationsMethodOutput = z.void()
type RevokeAppAuthorizationsMethodOutput = z.infer<
  typeof RevokeAppAuthorizationsMethodOutput
>

type RevokeAppAuthorizationsParams = {
  ctx: Context
  input: RevokeAppAuthorizationsMethodInput
}

interface RevokeAppAuthorizationsMethod {
  (
    params: RevokeAppAuthorizationsParams
  ): Promise<RevokeAppAuthorizationsMethodOutput>
}

export const revokeAppAuthorizationsMethod: RevokeAppAuthorizationsMethod =
  async ({ ctx, input }) => {
    const { accountURN, clientId } = input

    if (!ctx.starbaseClient) {
      throw new Error('missing starbase client')
    }

    const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`
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
