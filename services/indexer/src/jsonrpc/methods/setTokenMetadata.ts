import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { IndexRpcContext } from '../../types'

export type SetTokenMetadataParams = [
  tokenId: string,
  contract: string,
  metadata: string
]

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<IndexRpcContext>
) => {
  const [tokenId, contract, metadata] = request.params as SetTokenMetadataParams

  const metadataObj = JSON.parse(metadata)
  // TODO: save metadata to R2

  return openrpc.response(request, null)
}
