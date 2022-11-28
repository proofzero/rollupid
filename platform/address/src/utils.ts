import { isAddress } from '@ethersproject/address'
import type { JsonRpcResponse } from 'typed-json-rpc'
import { parseURN } from 'urns'

import { AddressURN, CoreType } from './types'

import { AddressCoreType } from './types'

export const resolve3RN = async (
  request: Request
): Promise<{
  coreType: CoreType
  addressType: AddressCoreType
  params: URLSearchParams
}> => {
  const urn = request.headers.get('X-Resource-3RN') as AddressURN
  // urn:threeid:address:?+<rcomponent>?=name=<do from name>#<do object class>:<class subtype>

  if (!urn) {
    throw new Error('missing X-Resource-3RN header')
  }

  const { nid: domain, nss: service, qcomponent, fragment } = parseURN(urn)
  // const { service, domain, object, descriptors } = parseUrn(urn)

  if (domain != 'threeid.xyz') {
    throw new Error(`invalid 3RN domain: ${domain}. Expected "threeid.xyz"`)
  }
  if (service != 'address') {
    throw new Error(`invalid 3RN service: ${service}. Expected "address"`)
  }
  if (!qcomponent) {
    throw new Error('missing 3RN qcomponent')
  }
  const qparams = new URLSearchParams(qcomponent)

  if (!fragment) {
    throw new Error(
      `missing 3RN fragment. Expected "<core type>:<address type>"`
    )
  }
  const [coreType, addressType] = fragment.split(':')

  return {
    coreType: coreType as CoreType,
    addressType: addressType as AddressCoreType,
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
