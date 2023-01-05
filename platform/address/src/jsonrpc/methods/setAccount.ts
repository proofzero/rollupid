import * as graph from '@kubelt/graph'
import * as openrpc from '@kubelt/openrpc'
import type { Edge } from '@kubelt/graph'
import type {
  RpcContext,
  RpcErrorDetail,
  RpcRequest,
  RpcService,
} from '@kubelt/openrpc'
import createEdgesClient from '@kubelt/platform-clients/edges'

import type { AccountURN } from '@kubelt/urns/account'
import type { AddressURN } from '@kubelt/urns/address'
import { AddressURNSpace } from '@kubelt/urns/address'
import { AccountURNSpace } from '@kubelt/urns/account'
import { linkAccountAddress } from '@kubelt/graph/util'

import { ErrorInvalidAccountId } from '../errors'

import { SetAccountParams } from '../../types'
import { EDGE_ADDRESS } from '@kubelt/graph/edges'

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<RpcContext>
) => {
  const edges: Fetcher = context.get('Edges')
  const nodeClient = context.get('node_client')

  // When the X-3RN header is parsed, the r-components contain details
  // of the type of address.
  const addrType = context.get('addr_type')
  const nodeType = context.get('node_type')
  const rComponents = `addr_type=${addrType}&node_type=${nodeType}`

  // This is the core part of the address, e.g. an Ethereum wallet
  // address, an e-mail address, etc. It's taken from the X-3RN header
  // included in the request.
  const name = context.get('name')
  // Convert to a base URN with no components.
  const address = AddressURNSpace.urn(name)
  // This address used to link the account node to the address node must
  // have the node_type and addr_type URN r-components included so they
  // can be stored in the database for later querying.
  const fullAddress = `${address}?+${rComponents}` as AddressURN

  const [account] = request.params as SetAccountParams
  if (!AccountURNSpace.is(account)) {
    const detail = Object.assign({ data: account }, ErrorInvalidAccountId)
    return openrpc.error(request, detail)
  }

  // Store the owning account for the address node in the node itself.
  await nodeClient.setAccount({ account })

  const edgesClient = createEdgesClient(edges)
  const linkResult = await edgesClient.makeEdge.mutate({
    src: account,
    dst: fullAddress,
    tag: EDGE_ADDRESS,
  })

  // Create a link between owning account node and the owned address
  // node using the edges service.
  // const linkResult = await linkAccountAddress(
  //   edges,
  //   account as AccountURN,
  //   fullAddress
  // )

  // TODO how about a nice predicate fn to distinguish these error
  // results?

  const edge = linkResult.edge
  return openrpc.response(request, {
    set: {
      account: edge.src,
      address: edge.dst,
    },
  })
}
