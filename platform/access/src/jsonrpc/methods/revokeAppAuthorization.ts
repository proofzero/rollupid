import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'

import {
  EDGE_AUTHORIZES,
  ROLLUP_INTERNAL_ACCESS_TOKEN_URN,
} from '../../constants'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AccessURNSpace } from '@proofzero/urns/access'
import { generateJKU, getPrivateJWK } from '../../jwk'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

export const RevokeAppAuthorizationMethodInput = z.object({
  clientId: z.string().min(1),
  issuer: z.string().optional(),
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
    const caller = router.createCaller(ctx)

    const { clientId } = input
    const { accountURN } = ctx

    if (!accountURN) {
      throw new Error('Expected Account URN to be present')
    }

    const name = `${AccountURNSpace.decode(accountURN)}@${clientId}`

    const accessURN = AccessURNSpace.componentizedUrn(name)
    const edgesResult = await caller.edges.getEdges({
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
      await caller.edges.removeEdge({
        tag: EDGE_AUTHORIZES,
        src: edgesResult.edges[i].src.baseUrn,
        dst: edgesResult.edges[i].dst.baseUrn,
      })
    }

    const addresses =
      (await caller.account.getAddresses({
        account: accountURN,
      })) ?? []

    for (const address of addresses) {
      await caller.edges.removeEdge({
        tag: EDGE_HAS_REFERENCE_TO,
        src: accessURN,
        dst: address.baseUrn,
      })
    }

    await caller.edges.deleteNode({
      urn: accessURN,
    })

    const accessNode = await initAccessNodeByName(name, ctx.Access)

    // const scope = ['admin']

    // const internalAccessToken = await accessNode.class.generateAccessToken({
    //   jku: generateJKU(input.issuer),
    //   jwk: getPrivateJWK(ctx),
    //   account: ROLLUP_INTERNAL_ACCESS_TOKEN_URN,
    //   clientId,
    //   expirationTime: '5 seconds',
    //   issuer: input.issuer,
    //   scope,
    // })

    const paymaster = await caller.starbase.getPaymaster({
      clientId,
    })

    const appData = await caller.access.getAppData({
      clientId,
    })

    if (
      paymaster &&
      appData?.smartWalletSessionKeys &&
      appData.smartWalletSessionKeys.length
    ) {
      await caller.address.revokeWalletSessionKeyBatch({
        projectId: paymaster.secret,
        smartWalletSessionKeys: appData.smartWalletSessionKeys,
      })

      await caller.access.setAppData({
        clientId,
        appData: { smartWalletSessionKeys: [] },
      })
    }

    await accessNode.class.deleteAll()
  }
