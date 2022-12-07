import { isAddress as isEthAddress } from '@ethersproject/address'
import type { JsonRpcResponse } from 'typed-json-rpc'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

import { AddressType, CoreType, CryptoCoreType, Environment } from './types'

export const resolveAddress3RN = async (
  request: Request
): Promise<{
  name: string
  nodeType: CoreType | undefined
  addressType: AddressType | undefined
  params: URLSearchParams | undefined
}> => {
  // 'urn:threeid:address/0x123?+node_type=crypto&addr_type=eth'
  const urn = request.headers.get('X-3RN') as AddressURN

  if (!urn) {
    throw new Error('missing X-3RN header')
  }

  const name = AddressURNSpace.decode(urn)
  const { rcomponent, qcomponent } = AddressURNSpace.parse(urn)

  const rparams = new URLSearchParams(rcomponent || '')

  let nodeType = rparams.get('node_type') as CoreType
  if (!nodeType) {
    // TODO: expand to support other node types
    if (name.startsWith('0x')) nodeType = CryptoCoreType.Crypto // next step will validate if this is correct

    if (name.endsWith('.eth')) nodeType = CryptoCoreType.Crypto // next step will validate if this is correct

    // TODO: broader validation
  }

  const addrType = rparams.get('addr_type') as AddressType

  const qparams = new URLSearchParams(qcomponent as string)

  return {
    name,
    nodeType,
    addressType: addrType,
    params: qparams,
  }
}

// TODO: move to crypto core as static method
export const resolveEthType = async (
  address: string
): Promise<{
  type: string
  address: string
  avatar?: string | null
  displayName?: string | null
} | null> => {
  if (isEthAddress(address)) {
    return {
      type: 'eth',
      address,
    }
  }
  if (address.endsWith('.eth')) {
    const ens = await resolveEns(address)
    return {
      type: 'eth',
      ...ens,
    }
  }

  return null
}

export const resolveEns = async (address: string) => {
  // NOTE: this only works for mainnet
  // possibly use alchemy or other provider to resolve?
  const ensRes = await fetch(`${ENS_RESOLVER_URL}/${address}`)
  const ens: {
    address: string
    avatar: string | null
    displayName: string | null
  } = await ensRes.json()
  return ens
}

export const getNftarVoucher = async (
  address: string,
  chain = 'ethereum',
  env: Environment
) => {
  chain = chain === 'eth' ? 'ethereum' : chain

  const nftarFetch = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.NFTAR_TOKEN}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: chain,
          chainId: env.NFTAR_CHAIN_ID,
        },
      },
    }),
  }
  const nftarRes = await fetch(`${env.NFTAR_URL}`, nftarFetch)
  const jsonRes: JsonRpcResponse = await nftarRes.json()

  if ('error' in jsonRes) {
    throw new Error(jsonRes.error.data.message)
  }

  return jsonRes.result
}
