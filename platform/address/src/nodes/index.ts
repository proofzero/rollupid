import { DurableObjectStubProxy } from 'do-proxy'
import Address from './address'
import ContractAddress from './contract'
import CryptoAddress from './crypto'
import OAuthAddress from './oauth'

export const initAddressNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Address.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export type DefaultNode = Awaited<ReturnType<typeof initAddressNodeByName>>

export const initCryptoNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_ADDR_BINDING = Address.wrap(durableObject)
  const MY_CRYPTO_BINDING = CryptoAddress.wrap(durableObject)
  const addrNode = MY_ADDR_BINDING.getByName(name)
  const cryptoNode = MY_CRYPTO_BINDING.getByName(name)

  const node = {
    ...addrNode,
    crypto: { ...cryptoNode },
  }

  return node
}

export type CryptoNode = Awaited<ReturnType<typeof initCryptoNodeByName>>

export const initOAuthNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_ADDR_BINDING = Address.wrap(durableObject)
  const MY_OAUTH_BINDING = OAuthAddress.wrap(durableObject)
  const addrNode = MY_ADDR_BINDING.getByName(name)
  const oauthNode = MY_OAUTH_BINDING.getByName(name)

  const node = {
    ...addrNode,
    oauth: { ...oauthNode },
  }

  return node
}

export type OAuthNode = Awaited<ReturnType<typeof initOAuthNodeByName>>

export const initContractNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_ADDR_BINDING = Address.wrap(durableObject)
  const MY_CONTRACT_BINDING = ContractAddress.wrap(durableObject)
  const addrNode = MY_ADDR_BINDING.getByName(name)
  const contractNode = MY_CONTRACT_BINDING.getByName(name)

  const node = {
    ...addrNode,
    contract: { ...contractNode },
  }

  return node
}

export type ContractNode = Awaited<ReturnType<typeof initContractNodeByName>>

export type AddressNode = DefaultNode | CryptoNode | OAuthNode | ContractNode
