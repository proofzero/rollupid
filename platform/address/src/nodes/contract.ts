import { DurableObjectStubProxy } from 'do-proxy'

import { AddressNode } from '.'
import { AddressProfile, Challenge } from '../types'
import { CryptoAddressType } from '@proofzero/types/address'

import ENSUtils from '@proofzero/platform-clients/ens-utils'
import Address from './address'
import { NONCE_OPTIONS } from '../constants'

type CryptoAddressProfile = AddressProfile<CryptoAddressType.Wallet>

export default class ContractAddress {
  declare node: AddressNode

  constructor(node: AddressNode) {
    this.node = node
  }

  async getProfile(): Promise<CryptoAddressProfile> {
    const [nickname, gradient, address] = await Promise.all([
      this.node.class.getNickname(),
      this.node.class.getGradient(),
      this.node.class.getAddress(),
    ])

    if (!address) throw new Error('address not found')

    const profile = await getCryptoAddressProfile(address)
    profile.icon = profile.icon || gradient

    if (profile.title.startsWith('0x') && nickname) {
      profile.title = nickname
    }

    profile.title = profile.title || address

    return profile
  }

  static async alarm(address: Address) {
    const challenges: Record<string, Challenge> =
      (await address.state.storage.get('challenges')) || {}
    for (const [nonce, challenge] of Object.entries(challenges)) {
      if (challenge.timestamp + NONCE_OPTIONS.ttl <= Date.now()) {
        delete challenges[nonce]
      }
    }
    await address.state.storage.put('challenges', challenges)
  }
}

const getCryptoAddressProfile = async (
  address: string
): Promise<CryptoAddressProfile> => {
  const ensClient = new ENSUtils()
  const { avatar, displayName } = await ensClient.getEnsEntry(address)

  return {
    address: address,
    title: displayName || '',
    icon: avatar || '',
    type: CryptoAddressType.Wallet,
  }
}

export type ContractAddressProxyStub = DurableObjectStubProxy<ContractAddress>
