import type { RpcContext } from '@kubelt/openrpc'
import { NodeType } from '../../types'

import {
  AlchemyClient,
  AlchemyChain,
  AlchemyClientConfig,
  WebhookType,
} from '@kubelt/alchemy-client'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (
    context.get('node_type') != NodeType.Crypto &&
    context.get('node_type') != NodeType.Contract
  ) {
    return
  }

  const nodeClient = context.get('node_client')
  if (!nodeClient) {
    return
  }

  const address = await nodeClient.getAddress()
  const type = await nodeClient.getType()

  if (!address || !type) {
    await nodeClient.setAddress({ address: context.get('name') })
    await nodeClient.setType({ type: context.get('addr_type') })

    if (context.get('node_type') == NodeType.Crypto) {
      // let's tell the node to register a webhook for this address
      const notifyEthClient: AlchemyClient = new AlchemyClient({
        token: context.get('TOKEN_ALCHEMY_NOTIFY'),
      } as AlchemyClientConfig)

      const ethRes = notifyEthClient.createWebhook({
        network: context.get('ALCHEMY_ETH_NETWORK'),
        webhookType: WebhookType.NFT_ACTIVIY,
        webhookUrl: context.get('URL_ALCHEMY_WEBHOOK'),
        addresses: [context.get('name')],
      })

      const notifyPolyClient: AlchemyClient = new AlchemyClient({
        token: context.get('TOKEN_ALCHEMY_NOTIFY'),
      } as AlchemyClientConfig)

      const polyRes = notifyPolyClient.createWebhook({
        network: context.get('ALCHEMY_POLYGON_NETWORK'),
        webhookType: WebhookType.NFT_ACTIVIY,
        webhookUrl: context.get('URL_ALCHEMY_WEBHOOK'),
        addresses: [context.get('name')],
      })

      const [ethWebhook, polyWebhook] = await Promise.all([ethRes, polyRes])

      // and let's set a short alarm to bootstrap itself
    }
  }
}
