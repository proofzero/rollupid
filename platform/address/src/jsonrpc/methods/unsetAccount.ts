import * as graph from '@kubelt/graph'
import * as openrpc from '@kubelt/openrpc'
import type { RpcContext, RpcRequest, RpcService } from '@kubelt/openrpc'
import type { AccountURN } from '@kubelt/urns/account'
import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { AccountURNSpace } from '@kubelt/urns/account'

import { EDGE_ADDRESS } from '@kubelt/graph/edges'
import { unlinkAccountAddress } from '@kubelt/graph/util'

import { ErrorInvalidAccountId } from '../errors'

import { UnsetAccountParams } from '../../types'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const edges: Fetcher = context.get('Edges')
  const nodeClient = context.get('node_client')

  // Get the address associated with the X-3RN included in the request.
  const name = context.get('name')
  const address = AddressURNSpace.urn(name) as AddressURN

  const [account] = request.params as UnsetAccountParams
  if (!AccountURNSpace.is(account)) {
    const detail = Object.assign({ data: account }, ErrorInvalidAccountId)
    return openrpc.error(request, detail)
  }

  // Remove the stored account in the node.
  await nodeClient.unsetAccount()

  // Unlink the address and account nodes, removing the "account" edge.
  const unlinkResult = await unlinkAccountAddress(edges, account, address)

  return openrpc.response(request, {
    unset: {
      account: account,
      address: address,
    },
  })
}
