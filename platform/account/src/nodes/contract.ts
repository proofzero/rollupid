import { DurableObjectStubProxy } from 'do-proxy'

import { InternalServerError } from '@proofzero/errors'
import { CryptoAccountType } from '@proofzero/types/account'
import ENSUtils from '@proofzero/platform-clients/ens-utils'

import { AccountNode } from '.'
import { AccountProfile } from '../types'

type CryptoAccountProfile = AccountProfile<CryptoAccountType.Wallet>

export default class ContractAccount {
  declare node: AccountNode

  constructor(node: AccountNode) {
    this.node = node
  }

  async getProfile(): Promise<CryptoAccountProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])

    if (!address)
      throw new InternalServerError({ message: 'address not found' })

    const profile = getCryptoAccountProfile(address) as CryptoAccountProfile
    profile.icon = profile.icon || gradient

    if (nickname) {
      profile.title = nickname
    }

    profile.title = profile.title || address

    return profile
  }
}

const getCryptoAccountProfile = (
  address: string,
  type = CryptoAccountType.Wallet
) => ({
  address,
  type,
})

export type ContractAccountProxyStub = DurableObjectStubProxy<ContractAccount>
