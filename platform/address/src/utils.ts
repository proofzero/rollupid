import { isAddress } from '@ethersproject/address'
import { URN } from '@kubelt/security'
import { parseUrn } from '@kubelt/security/urn'
import { JsonRpcResponse } from 'typed-json-rpc'
import { AddressCoreType, CryptoAddressType } from './types'

export const resolve3RN = async (
  request: Request
): Promise<URN.URN & { address: string; type: AddressCoreType }> => {
  const urn = request.headers.get('X-Resource-3RN')
  if (!urn) {
    throw new Error('missing X-Resource-3RN header')
  }
  const { service, domain, object, descriptors } = parseUrn(urn)

  if (domain != 'threeid.xyz') {
    throw new Error(`invalid 3RN domain: ${domain}. Expected "threeid.xyz"`)
  }
  if (service != 'address') {
    throw new Error(`invalid 3RN service: ${service}. Expected "address"`)
  }
  if (object != 'address') {
    throw new Error(`invalid 3RN object: ${object}. Expected "address"`)
  }

  const { name, type, ens } = descriptors as URN.DESCRIPTORS

  let address = name

  switch (type) {
    case CryptoAddressType.ETHEREUM:
    case CryptoAddressType.ETH: {
      const resolvedType = await resolveEthType(name || ens) // we may see an ens descriptor if address is unknown
      if (!resolvedType) {
        throw `could not resolve ethereum address type from ${urn}`
      }
      address = resolvedType.address
      break
    }
    default:
      throw `unsupported address type ${type}`
  }

  return { service, domain, object, descriptors, address, type }
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
