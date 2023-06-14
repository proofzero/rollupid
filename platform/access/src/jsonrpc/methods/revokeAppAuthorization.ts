import { z } from 'zod'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'

import {
  EDGE_AUTHORIZES,
  ROLLUP_INTERNAL_ACCESS_TOKEN_URN,
} from '../../constants'
import { AccountURNSpace } from '@proofzero/urns/account'
import { AccessURNSpace } from '@proofzero/urns/access'
import { generateJKU, getPrivateJWK } from '../../jwk'

import createStarbaseClient from '@proofzero/packages/platform-clients/starbase'
import createAddressClient from '@proofzero/packages/platform-clients/address'

import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { appRouter } from '../router'
import { PlatformAddressURNHeader } from '@proofzero/types/headers'
import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'
import { generateSmartWalletAddressUrn } from '@proofzero/platform.address/src/utils'

export const RevokeAppAuthorizationMethodInput = z.object({
  clientId: z.string().min(1),
  issuer: z.string(),
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
    const caller = appRouter.createCaller(ctx)
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

    const addresses =
      (await ctx.accountClient.getAddresses.query({
        account: accountURN,
      })) ?? []

    for (const address of addresses) {
      await ctx.edgesClient.removeEdge.mutate({
        tag: EDGE_HAS_REFERENCE_TO,
        src: accessURN,
        dst: address.baseUrn,
      })
    }

    await ctx.edgesClient.deleteNode.mutate({
      urn: accessURN,
    })

    const accessNode = await initAccessNodeByName(name, ctx.Access)

    const scope = ['admin']

    const internalAccessToken = await accessNode.class.generateAccessToken({
      jku: generateJKU(input.issuer),
      jwk: getPrivateJWK(ctx),
      account: ROLLUP_INTERNAL_ACCESS_TOKEN_URN,
      clientId,
      expirationTime: '5 seconds',
      issuer: input.issuer,
      scope,
    })

    const starbaseClient = createStarbaseClient(ctx.Starbase, {
      Authorization: `Bearer ${internalAccessToken}`,
      ...generateTraceContextHeaders(ctx.traceSpan),
    })
    const paymaster = await starbaseClient.getPaymaster.query({
      clientId,
    })

    const appData = await caller.getAppData({
      clientId,
    })

    if (appData?.smartWalletSessionKeys?.length) {
      await Promise.all(
        appData.smartWalletSessionKeys.map(
          async (sessionKeyAddresses: {
            smartContractWalletAddress: string
            devEthereumAddress: string
          }) => {
            const { baseAddressURN } = generateSmartWalletAddressUrn(
              sessionKeyAddresses.smartContractWalletAddress,
              '' // empty string because we only need a base urn
            )
            const addressClient = createAddressClient(ctx.Address, {
              [PlatformAddressURNHeader]: baseAddressURN,
              ...generateTraceContextHeaders(ctx.traceSpan),
            })

            await addressClient.revokeWalletSessionKey.mutate({
              projectId: paymaster.secret,
              publicSessionKey: sessionKeyAddresses.devEthereumAddress,
            })
          }
        )
      )
    }

    await accessNode.class.deleteAll()
  }
