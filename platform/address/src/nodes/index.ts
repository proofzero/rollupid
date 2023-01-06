import ContractAddress from './contract'
import CryptoAddress from './crypto'
import OAuthAddress from './oauth'

export const initCryptoNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = CryptoAddress.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const initOAuthNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = OAuthAddress.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export const initContractNodeByName = async (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = ContractAddress.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}
