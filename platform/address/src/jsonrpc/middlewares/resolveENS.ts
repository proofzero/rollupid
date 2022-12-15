import type { RpcContext } from '@kubelt/openrpc'
import ENSUtils from '@kubelt/platform-clients/ens-utils'

import { CryptoAddressType } from '../../types'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (
    context.get('addr_type') != CryptoAddressType.Ethereum ||
    context.get('addr_type') != CryptoAddressType.ETH
  ) {
    return
  }

  const ensClient = new ENSUtils()
  const response = await ensClient.getEnsEntry(context.get('name'))

  context.set('address_description', response)
}
