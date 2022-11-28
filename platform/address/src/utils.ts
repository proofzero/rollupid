import { isAddress } from '@ethersproject/address'
import type { JsonRpcResponse } from 'typed-json-rpc'
import { parseURN, URNSpace } from 'urns'

import {
  AddressURN,
  CoreType,
  CryptoAddressType,
  CryptoCoreType,
} from './types'

import { AddressType } from './types'

const space = new URNSpace('threeid', {
  decode: (nss) => {
    const [service, name] = nss.split('/')
    if (service != 'address') {
      throw `Invalid 3RN service name. Got ${service}, expected "address".`
    }
    return name
  },
})

export const resolve3RN = async (
  request: Request
): Promise<{
  nodeType: CoreType
  name: string
  addressType: AddressType
  params: URLSearchParams
}> => {
  const urn = request.headers.get('X-Resource-3RN') as AddressURN
  // 'urn:threeid:address/0x123?+node_type=crypto&addr_type=eth'

  if (!urn) {
    throw new Error('missing X-Resource-3RN header')
  }

  const { rcomponent, qcomponent } = parseURN(urn)

  const name = space.decode(urn)

  if (!rcomponent) {
    throw new Error('missing r component in 3RN')
  }

  const rparams = new URLSearchParams(rcomponent)

  const nodeType = rparams.get('node_type') as CoreType
  if (!nodeType) {
    throw new Error(
      `missing 3RN type q component parameter. Expected one of ${Object.values(
        CryptoCoreType
      )}`
    )
  }

  const addrType = rparams.get('addr_type') as AddressType
  if (!addrType) {
    throw new Error(
      `missing 3RN type q component parameter. Expected one of ${Object.values(
        CryptoAddressType
      )}`
    )
  }

  const qparams = new URLSearchParams(qcomponent as string)

  return {
    nodeType,
    name,
    addressType: addrType as AddressType,
    params: qparams,
  }
}

export const resolveEthType = async (
  address: string
): Promise<{
  type: string
  address: string
  avatar?: string | null
  displayName?: string | null
} | null> => {
  if (isAddress(address)) {
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
  chainId = NFTAR_CHAIN_ID
) => {
  const nftarFetch = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NFTAR_TOKEN}`,
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: '3id_genPFP',
      params: {
        account: address,
        blockchain: {
          name: chain,
          chainId,
        },
      },
    }),
  }
  const nftarRes = await fetch(`${NFTAR_URL}`, nftarFetch)
  const jsonRes: JsonRpcResponse = await nftarRes.json()

  if ('error' in jsonRes) {
    throw new Error(jsonRes.error.data.message)
  }

  return jsonRes.result
}
