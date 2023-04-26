import Address from './address'
import ContractAddress from './contract'
import AppleAddress from './apple'
import CryptoAddress from './crypto'
import DiscordAddress from './discord'
import EmailAddress from './email'
import GithubAddress from './github'
import GoogleAddress from './google'
import MicrosoftAddress from './microsoft'
import TwitterAddress from './twitter'

export {
  AppleAddress,
  CryptoAddress,
  ContractAddress,
  DiscordAddress,
  EmailAddress,
  GithubAddress,
  GoogleAddress,
  MicrosoftAddress,
  TwitterAddress,
}

export const initAddressNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Address.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export type AddressNode = ReturnType<typeof initAddressNodeByName>
