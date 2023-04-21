import { z } from 'zod'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'

import { EDGE_AUTHORIZES } from '../../constants'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AccessURNSpace } from '@proofzero/urns/access'
import { EDGE_ADDRESS } from '@proofzero/platform.address/src/constants'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export const RevokeAppAuthorizationMethodInput = z.object({
  clientId: z.string().min(1),
})

type RevokeAppAuthorizationMethodInput = z.infer<
  typeof RevokeAppAuthorizationMethodInput
>

export const RevokeAppAuthorizationMethodOutput = z.void()
type RevokeAppAuthorizationMethodOutput = z.infer<
  typeof RevokeAppAuthorizationMethodOutput
>

type RevokeAppAuthorizationParams = {
  ctx: Context
  input: RevokeAppAuthorizationMethodInput
}

interface RevokeAppAuthorizationMethod {
  (
    params: RevokeAppAuthorizationParams
  ): Promise<RevokeAppAuthorizationMethodOutput>
}

export const revokeAppAuthorizationMethod: RevokeAppAuthorizationMethod =
  async ({ ctx, input }) => {
    const { clientId } = input
    const { accountURN } = ctx

    if (!accountURN) {
      throw new Error('Expected Account URN to be present')
    }

    const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`

    if (!ctx.edgesClient) {
      throw new Error('Expected edgesClient to be present')
    }

    const accessURN = AccessURNSpace.componentizedUrn(name)
    const edgesResult = await ctx.edgesClient.getEdges.query({
      query: {
        src: { baseUrn: accountURN },
        dst: { baseUrn: accessURN },
        tag: EDGE_AUTHORIZES,
      },
    })

    if (!edgesResult) {
      console.warn(
        `Get authorization edge operation failed, app (${clientId}) for account (${accountURN})`
      )
    }

    if (edgesResult?.edges.length === 0) {
      console.warn(
        `No authorization edge found, app (${clientId}) for account (${accountURN})`
      )
    }

    for (let i = 0; i < edgesResult?.edges.length; i++) {
      await ctx.edgesClient.removeEdge.mutate({
        tag: EDGE_AUTHORIZES,
        src: edgesResult.edges[i].src.baseUrn,
        dst: edgesResult.edges[i].dst.baseUrn,
      })
    }

    const { edges: addressEdges } = await ctx.edgesClient.getEdges.query({
      query: {
        src: { baseUrn: accountURN },
        tag: EDGE_ADDRESS,
      },
    })

    for (let i = 0; i < addressEdges.length; i++) {
      await ctx.edgesClient.removeEdge.mutate({
        tag: EDGE_HAS_REFERENCE_TO,
        src: accessURN,
        dst: addressEdges[i].dst.baseUrn,
      })
    }

    const accessNode = await initAccessNodeByName(name, ctx.Access)
    await accessNode.class.deleteAll()
  }
