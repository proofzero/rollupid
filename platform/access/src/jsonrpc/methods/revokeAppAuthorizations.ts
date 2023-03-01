import { z } from 'zod'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AccountURNInput } from '@kubelt/platform-middleware/inputValidators'

import { EDGE_AUTHORIZES } from '../../constants'
import { AccountURNSpace } from '@kubelt/urns/account'
import { AccessURNSpace } from '@kubelt/urns/access'

export const RevokeAppAuthorizationsMethodInput = z.object({
  accountURN: AccountURNInput,
  clientId: z.string().min(1),
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

    const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`

    const accessDst = AccessURNSpace.componentizedUrn(name)
    const edgesResult = await ctx.edgesClient?.getEdges.query({
      query: {
        src: { baseUrn: accountURN },
        dst: { baseUrn: accessDst },
        tag: EDGE_AUTHORIZES,
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

    const accessNode = await initAccessNodeByName(name, ctx.Access)
    await accessNode.class.revokeAll()
  }
