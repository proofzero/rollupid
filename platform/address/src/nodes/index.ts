import Address from './address'
import OAuthAddress from './oauth'
import ContractAddress from './contract'
import CryptoAddress from './crypto'

import AppleAddress from './apple'
import DiscordAddress from './discord'
import EmailAddress from './email'
import GithubAddress from './github'
import GoogleAddress from './google'
import MicrosoftAddress from './microsoft'
import TwitterAddress from './twitter'

export {
  Address,
  ContractAddress,
  CryptoAddress,
  OAuthAddress,
  AppleAddress,
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
