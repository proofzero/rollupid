import { z } from 'zod'

import { router } from '@proofzero/platform.core'

import { Context } from '../../context'
import { initAuthorizationNodeByName } from '../../nodes'

import { EDGE_AUTHORIZES } from '../../constants'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import { AuthorizationURNSpace } from '@proofzero/urns/authorization'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { createAnalyticsEvent } from '@proofzero/utils/analytics'

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
    const { identityURN } = ctx

    if (!identityURN) {
      throw new Error('Expected Identity URN to be present')
    }

    const authorizationURN = AuthorizationURNSpace.componentizedUrn(
      `${IdentityURNSpace.decode(identityURN)}@${clientId}`
    )

    const edgesResult = await caller.edges.getEdges({
      query: {
        src: { baseUrn: identityURN },
        dst: { baseUrn: authorizationURN },
        tag: EDGE_AUTHORIZES,
      },
    })

    if (!edgesResult) {
      console.warn(
        `Get authorization edge operation failed, app (${clientId}) for identity (${identityURN})`
      )
    }

    if (edgesResult?.edges.length === 0) {
      console.warn(
        `No authorization edge found, app (${clientId}) for identity (${identityURN})`
      )
    }

    for (let i = 0; i < edgesResult?.edges.length; i++) {
      await caller.edges.removeEdge({
        tag: EDGE_AUTHORIZES,
        src: edgesResult.edges[i].src.baseUrn,
        dst: edgesResult.edges[i].dst.baseUrn,
      })
    }

    const accounts =
      (await caller.identity.getAccounts({
        URN: identityURN,
      })) ?? []

    for (const account of accounts) {
      await caller.edges.removeEdge({
        tag: EDGE_HAS_REFERENCE_TO,
        src: authorizationURN,
        dst: account.baseUrn,
      })
    }

    await caller.edges.deleteNode({
      urn: authorizationURN,
    })

    const authorizationNode = initAuthorizationNodeByName(
      authorizationURN,
      ctx.env.Authorization
    )

    // const scope = ['admin']

    // const internalAccessToken = await authorizationNode.class.generateAccessToken({
    //   jku: generateJKU(input.issuer),
    //   jwk: getPrivateJWK(ctx),
    //   identity: ROLLUP_INTERNAL_ACCESS_TOKEN_URN,
    //   clientId,
    //   expirationTime: '5 seconds',
    //   issuer: input.issuer,
    //   scope,
    // })

    const paymaster = await caller.starbase.getPaymaster({
      clientId,
    })

    const appData = await caller.authorization.getAppData({
      clientId,
    })

    if (
      paymaster &&
      appData?.smartWalletSessionKeys &&
      appData.smartWalletSessionKeys.length
    ) {
      await caller.account.revokeWalletSessionKeyBatch({
        projectId: paymaster.secret,
        smartWalletSessionKeys: appData.smartWalletSessionKeys,
      })

      await caller.authorization.setAppData({
        clientId,
        appData: { smartWalletSessionKeys: [] },
      })
    }

    await authorizationNode.class.deleteAll()

    ctx.waitUntil?.(
      createAnalyticsEvent({
        apiKey: ctx.env.POSTHOG_API_KEY,
        distinctId: identityURN,
        eventName: 'identity_revoked_authorization',
        properties: {
          $groups: { app: clientId },
        },
      })
    )
  }
