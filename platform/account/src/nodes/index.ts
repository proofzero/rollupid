import Account from './account'
import OAuthAccount from './oauth'
import ContractAccount from './contract'
import CryptoAccount from './crypto'

import AppleAccount from './apple'
import DiscordAccount from './discord'
import EmailAccount from './email'
import GithubAccount from './github'
import GoogleAccount from './google'
import MicrosoftAccount from './microsoft'
import TwitterAccount from './twitter'

export {
  Account,
  ContractAccount,
  CryptoAccount,
  OAuthAccount,
  AppleAccount,
  DiscordAccount,
  EmailAccount,
  GithubAccount,
  GoogleAccount,
  MicrosoftAccount,
  TwitterAccount,
}

export const initAccountNodeByName = (
  name: string,
  durableObject: DurableObjectNamespace
) => {
  const MY_DO_BINDING = Account.wrap(durableObject)
  const node = MY_DO_BINDING.getByName(name)
  return node
}

export type AccountNode = ReturnType<typeof initAccountNodeByName>
