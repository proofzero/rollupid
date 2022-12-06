import type { RpcContext } from '@kubelt/openrpc'

import { CryptoAddressType, EthereumAddressDescription } from '../../types'

export default async (request: Readonly<Request>, context: RpcContext) => {
  if (context.get('addr_type') != CryptoAddressType.Ethereum) {
    return
  }

  const response = await fetch(
    `${context.get('ENS_RESOLVER_URL')}/${context.get('name')}`
  )

  context.set(
    'address_description',
    await response.json<EthereumAddressDescription>()
  )
}
